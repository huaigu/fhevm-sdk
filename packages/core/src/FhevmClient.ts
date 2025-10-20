import { ethers, type Eip1193Provider, JsonRpcProvider } from 'ethers';
import type {
  FhevmConfig,
  FhevmStatus,
  InitParams,
  EncryptParams,
  EncryptResult,
  DecryptRequest,
  DecryptResult,
  FhevmInstance,
  FhevmInstanceConfig,
  StorageAdapter,
} from './types';
import { MemoryStorage } from './storage';
import {
  RelayerSDKLoader,
  isFhevmWindow,
  PublicKeyStorage,
  FhevmDecryptionSignature,
  DEFAULT_MOCK_CHAINS,
} from './utils';
import type { FhevmWindow } from './utils';

/**
 * Custom error class for FHEVM operations
 */
export class FhevmError extends Error {
  code: string;

  constructor(code: string, message?: string, options?: { cause?: unknown }) {
    super(message);
    this.code = code;
    this.name = 'FhevmError';
    if (options?.cause) {
      (this as any).cause = options.cause;
    }
  }
}

/**
 * Error thrown when an operation is aborted
 */
export class FhevmAbortError extends Error {
  constructor(message = 'FHEVM operation was cancelled') {
    super(message);
    this.name = 'FhevmAbortError';
  }
}

/**
 * Get chain ID from provider
 */
async function getChainId(providerOrUrl: Eip1193Provider | string): Promise<number> {
  if (typeof providerOrUrl === 'string') {
    const provider = new JsonRpcProvider(providerOrUrl);
    try {
      return Number((await provider.getNetwork()).chainId);
    } finally {
      provider.destroy();
    }
  }
  const chainId = await providerOrUrl.request({ method: 'eth_chainId' });
  return Number.parseInt(chainId as string, 16);
}

/**
 * Check if URL is a Web3 node
 */
async function getWeb3Client(rpcUrl: string): Promise<string> {
  const rpc = new JsonRpcProvider(rpcUrl);
  try {
    const version = await rpc.send('web3_clientVersion', []);
    return version;
  } catch (e) {
    throw new FhevmError(
      'WEB3_CLIENTVERSION_ERROR',
      `The URL ${rpcUrl} is not a Web3 node or is not reachable. Please check the endpoint.`,
      { cause: e }
    );
  } finally {
    rpc.destroy();
  }
}

/**
 * Try to fetch FHEVM Hardhat node metadata
 */
async function tryFetchFHEVMHardhatNodeMetadata(rpcUrl: string): Promise<
  | {
      ACLAddress: `0x${string}`;
      InputVerifierAddress: `0x${string}`;
      KMSVerifierAddress: `0x${string}`;
    }
  | undefined
> {
  const version = await getWeb3Client(rpcUrl);
  if (typeof version !== 'string' || !version.toLowerCase().includes('hardhat')) {
    // Not a Hardhat Node
    return undefined;
  }
  try {
    const rpc = new JsonRpcProvider(rpcUrl);
    try {
      const metadata = await rpc.send('fhevm_relayer_metadata', []);
      if (!metadata || typeof metadata !== 'object') {
        return undefined;
      }
      if (
        !(
          'ACLAddress' in metadata &&
          typeof metadata.ACLAddress === 'string' &&
          metadata.ACLAddress.startsWith('0x')
        )
      ) {
        return undefined;
      }
      if (
        !(
          'InputVerifierAddress' in metadata &&
          typeof metadata.InputVerifierAddress === 'string' &&
          metadata.InputVerifierAddress.startsWith('0x')
        )
      ) {
        return undefined;
      }
      if (
        !(
          'KMSVerifierAddress' in metadata &&
          typeof metadata.KMSVerifierAddress === 'string' &&
          metadata.KMSVerifierAddress.startsWith('0x')
        )
      ) {
        return undefined;
      }
      return metadata;
    } finally {
      rpc.destroy();
    }
  } catch {
    // Not a FHEVM Hardhat Node
    return undefined;
  }
}

/**
 * Framework-agnostic FHEVM client
 * Handles initialization, encryption, and decryption
 */
export class FhevmClient {
  private config: FhevmConfig;
  private storage: StorageAdapter;
  private publicKeyStorage: PublicKeyStorage;
  private instance: FhevmInstance | null = null;
  private status: FhevmStatus = 'idle';
  private statusListeners: Set<(status: FhevmStatus) => void> = new Set();

  constructor(config: FhevmConfig = {}) {
    this.config = config;
    this.storage = config.storage || new MemoryStorage();
    this.publicKeyStorage = new PublicKeyStorage(this.storage);
  }

  /**
   * Get current status
   */
  public getStatus(): FhevmStatus {
    return this.status;
  }

  /**
   * Subscribe to status changes
   */
  public onStatusChange(listener: (status: FhevmStatus) => void): () => void {
    this.statusListeners.add(listener);
    return () => {
      this.statusListeners.delete(listener);
    };
  }

  /**
   * Update status and notify listeners
   */
  private setStatus(status: FhevmStatus): void {
    this.status = status;
    this.statusListeners.forEach((listener) => listener(status));
  }

  /**
   * Initialize the FHEVM instance
   */
  public async init(params: InitParams, signal?: AbortSignal): Promise<FhevmInstance> {
    const throwIfAborted = () => {
      if (signal?.aborted) throw new FhevmAbortError();
    };

    try {
      this.setStatus('loading');

      // Get chain ID
      const chainId = params.chainId || (await getChainId(params.provider));
      throwIfAborted();

      // Check for mock chains
      const mockChains: Record<number, string> = {
        ...DEFAULT_MOCK_CHAINS,
        ...(this.config.mockChains || {}),
      };

      const isMockChain = chainId in mockChains;
      const rpcUrl =
        typeof params.provider === 'string' ? params.provider : mockChains[chainId];

      // Handle mock chains (Hardhat)
      if (isMockChain && rpcUrl) {
        const metadata = await tryFetchFHEVMHardhatNodeMetadata(rpcUrl);
        throwIfAborted();

        if (metadata) {
          // Dynamic import to avoid bundling mock utils in production
          const mockUtils = await import('@fhevm/mock-utils');
          const instance = await (mockUtils as any).createMockInstance({
            rpcUrl,
            chainId,
            aclAddress: metadata.ACLAddress,
            kmsVerifierAddress: metadata.KMSVerifierAddress,
            inputVerifierAddress: metadata.InputVerifierAddress,
          });
          this.instance = instance as FhevmInstance;
          throwIfAborted();
          this.setStatus('ready');
          return this.instance;
        }
      }

      throwIfAborted();

      // Browser-only path for production chains
      if (typeof window === 'undefined') {
        throw new FhevmError(
          'BROWSER_REQUIRED',
          'FHEVM SDK requires a browser environment for production chains'
        );
      }

      // Load SDK if not already loaded
      if (!isFhevmWindow(window)) {
        const loader = new RelayerSDKLoader({ trace: console.log });
        await loader.load();
        throwIfAborted();
      }

      // Initialize SDK if not initialized
      const win = window as unknown as FhevmWindow;
      if (!win.relayerSDK.__initialized__) {
        const result = await win.relayerSDK.initSDK();
        win.relayerSDK.__initialized__ = result;
        if (!result) {
          throw new FhevmError('SDK_INIT_FAILED', 'Failed to initialize Relayer SDK');
        }
        throwIfAborted();
      }

      // Get ACL address
      const aclAddress = win.relayerSDK.SepoliaConfig.aclContractAddress;
      if (!ethers.isAddress(aclAddress)) {
        throw new FhevmError('INVALID_ACL_ADDRESS', `Invalid ACL address: ${aclAddress}`);
      }

      // Load public keys from storage
      const pub = await this.publicKeyStorage.get(aclAddress);
      throwIfAborted();

      // Create instance config
      const config: FhevmInstanceConfig = {
        ...win.relayerSDK.SepoliaConfig,
        network: params.provider,
        // Only include publicKey and publicParams if they exist
        ...(pub.publicKey?.data && { publicKey: pub.publicKey.data }),
        ...(pub.publicParams?.['2048']?.publicParams && {
          publicParams: pub.publicParams['2048'].publicParams,
        }),
      };

      // Create instance
      this.instance = (await win.relayerSDK.createInstance(config)) as FhevmInstance;

      // Save public key and params
      await this.publicKeyStorage.set(
        aclAddress,
        {
          publicKeyId: pub.publicKey?.id || this.instance.getPublicKey(),
          publicKey: this.instance.getPublicKey(),
        },
        {
          publicParamsId: 'default',
          publicParams: this.instance.getPublicParams(2048),
        }
      );

      throwIfAborted();
      this.setStatus('ready');
      return this.instance;
    } catch (error) {
      this.setStatus('error');
      throw error;
    }
  }

  /**
   * Get the FHEVM instance (must call init first)
   */
  public getInstance(): FhevmInstance {
    if (!this.instance) {
      throw new FhevmError('NOT_INITIALIZED', 'FHEVM instance not initialized. Call init() first.');
    }
    return this.instance;
  }

  /**
   * Get public key
   */
  public getPublicKey(): string {
    return this.getInstance().getPublicKey();
  }

  /**
   * Encrypt data
   */
  public async encrypt(params: EncryptParams): Promise<EncryptResult> {
    const instance = this.getInstance();
    const encryptedInput = instance.createEncryptedInput(
      params.contractAddress,
      params.userAddress
    );

    // Add value based on type
    const input = encryptedInput as any;
    switch (params.type) {
      case 'ebool':
        input.addBool(Boolean(params.value));
        break;
      case 'euint8':
        input.addUint8(Number(params.value));
        break;
      case 'euint16':
        input.addUint16(Number(params.value));
        break;
      case 'euint32':
        input.addUint32(Number(params.value));
        break;
      case 'euint64':
        input.addUint64(BigInt(params.value));
        break;
      case 'euint128':
        input.addUint128(BigInt(params.value));
        break;
      case 'euint256':
        input.addUint256(BigInt(params.value));
        break;
      case 'eaddress':
        input.addAddress(String(params.value));
        break;
      default:
        throw new FhevmError('INVALID_TYPE', `Invalid encrypted type: ${params.type}`);
    }

    // Encrypt and get result
    const encrypted = await input.encrypt();
    return {
      handles: encrypted.handles,
      inputProof: encrypted.inputProof,
    };
  }

  /**
   * Decrypt data (requires signer)
   */
  public async decrypt(
    requests: DecryptRequest[],
    signer: ethers.JsonRpcSigner
  ): Promise<DecryptResult> {
    const instance = this.getInstance();
    const contractAddresses = [
      ...new Set(requests.map((r) => r.contractAddress)),
    ] as `0x${string}`[];

    // Get or create decryption signature
    const decryptSig = await FhevmDecryptionSignature.loadOrSign(
      instance,
      contractAddresses,
      signer,
      this.storage
    );

    if (!decryptSig) {
      throw new FhevmError('SIGNATURE_FAILED', 'Failed to create decryption signature');
    }

    // Decrypt using userDecrypt
    const result = await instance.userDecrypt(
      requests.map((r) => ({ handle: r.handle, contractAddress: r.contractAddress })),
      decryptSig.privateKey,
      decryptSig.publicKey,
      decryptSig.signature,
      contractAddresses,
      decryptSig.userAddress,
      decryptSig.startTimestamp,
      decryptSig.durationDays
    );

    return result;
  }
}
