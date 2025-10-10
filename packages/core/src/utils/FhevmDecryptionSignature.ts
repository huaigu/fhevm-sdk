import { ethers } from 'ethers';
import type {
  FhevmDecryptionSignatureType,
  FhevmInstance,
  EIP712Type,
  StorageAdapter,
} from '../types';

/**
 * Get current timestamp in seconds
 */
function timestampNow(): number {
  return Math.floor(Date.now() / 1000);
}

/**
 * Storage key for decryption signatures
 * Uses EIP-712 hash to create unique keys
 */
class FhevmDecryptionSignatureStorageKey {
  private _contractAddresses: `0x${string}`[];
  private _userAddress: `0x${string}`;
  private _publicKey: string | undefined;
  private _key: string;

  constructor(
    instance: FhevmInstance,
    contractAddresses: string[],
    userAddress: string,
    publicKey?: string
  ) {
    if (!ethers.isAddress(userAddress)) {
      throw new TypeError(`Invalid address ${userAddress}`);
    }

    const sortedContractAddresses = (contractAddresses as `0x${string}`[]).sort();

    // Create EIP-712 structure for key generation
    const emptyEIP712 = (instance as any).createEIP712(
      publicKey ?? ethers.ZeroAddress,
      sortedContractAddresses,
      0,
      0
    );

    try {
      const hash = ethers.TypedDataEncoder.hash(
        emptyEIP712.domain,
        { UserDecryptRequestVerification: emptyEIP712.types.UserDecryptRequestVerification },
        emptyEIP712.message
      );

      this._contractAddresses = sortedContractAddresses;
      this._userAddress = userAddress as `0x${string}`;
      this._publicKey = publicKey;
      this._key = `fhevm:decryptSig:${userAddress}:${hash}`;
    } catch (e) {
      throw e as any;
    }
  }

  get contractAddresses(): `0x${string}`[] {
    return this._contractAddresses;
  }

  get userAddress(): `0x${string}` {
    return this._userAddress;
  }

  get publicKey(): string | undefined {
    return this._publicKey;
  }

  get key(): string {
    return this._key;
  }
}

/**
 * Framework-agnostic decryption signature management
 * Handles EIP-712 signatures for decryption authorization (365-day cache)
 */
export class FhevmDecryptionSignature {
  private _publicKey: string;
  private _privateKey: string;
  private _signature: string;
  private _startTimestamp: number;
  private _durationDays: number;
  private _userAddress: `0x${string}`;
  private _contractAddresses: `0x${string}`[];
  private _eip712: EIP712Type;

  private constructor(parameters: FhevmDecryptionSignatureType) {
    if (!FhevmDecryptionSignature.checkIs(parameters)) {
      throw new TypeError('Invalid FhevmDecryptionSignatureType');
    }
    this._publicKey = parameters.publicKey;
    this._privateKey = parameters.privateKey;
    this._signature = parameters.signature;
    this._startTimestamp = parameters.startTimestamp;
    this._durationDays = parameters.durationDays;
    this._userAddress = parameters.userAddress;
    this._contractAddresses = parameters.contractAddresses;
    this._eip712 = parameters.eip712;
  }

  public get privateKey() {
    return this._privateKey;
  }

  public get publicKey() {
    return this._publicKey;
  }

  public get signature() {
    return this._signature;
  }

  public get contractAddresses() {
    return this._contractAddresses;
  }

  public get startTimestamp() {
    return this._startTimestamp;
  }

  public get durationDays() {
    return this._durationDays;
  }

  public get userAddress() {
    return this._userAddress;
  }

  /**
   * Type guard for FhevmDecryptionSignatureType
   */
  static checkIs(s: unknown): s is FhevmDecryptionSignatureType {
    if (!s || typeof s !== 'object') {
      return false;
    }
    if (!('publicKey' in s && typeof (s as any).publicKey === 'string')) {
      return false;
    }
    if (!('privateKey' in s && typeof (s as any).privateKey === 'string')) {
      return false;
    }
    if (!('signature' in s && typeof (s as any).signature === 'string')) {
      return false;
    }
    if (!('startTimestamp' in s && typeof (s as any).startTimestamp === 'number')) {
      return false;
    }
    if (!('durationDays' in s && typeof (s as any).durationDays === 'number')) {
      return false;
    }
    if (!('contractAddresses' in s && Array.isArray((s as any).contractAddresses))) {
      return false;
    }
    for (let i = 0; i < (s as any).contractAddresses.length; ++i) {
      if (typeof (s as any).contractAddresses[i] !== 'string') return false;
      if (!((s as any).contractAddresses[i] as string).startsWith('0x')) return false;
    }
    if (
      !(
        'userAddress' in s &&
        typeof (s as any).userAddress === 'string' &&
        (s as any).userAddress.startsWith('0x')
      )
    ) {
      return false;
    }
    if (
      !(
        'eip712' in s &&
        typeof (s as any).eip712 === 'object' &&
        (s as any).eip712 !== null
      )
    ) {
      return false;
    }
    if (!('domain' in (s as any).eip712 && typeof (s as any).eip712.domain === 'object')) {
      return false;
    }
    if (
      !(
        'primaryType' in (s as any).eip712 &&
        typeof (s as any).eip712.primaryType === 'string'
      )
    ) {
      return false;
    }
    if (!('message' in (s as any).eip712)) {
      return false;
    }
    if (
      !(
        'types' in (s as any).eip712 &&
        typeof (s as any).eip712.types === 'object' &&
        (s as any).eip712.types !== null
      )
    ) {
      return false;
    }
    return true;
  }

  /**
   * Serialize to JSON
   */
  toJSON() {
    return {
      publicKey: this._publicKey,
      privateKey: this._privateKey,
      signature: this._signature,
      startTimestamp: this._startTimestamp,
      durationDays: this._durationDays,
      userAddress: this._userAddress,
      contractAddresses: this._contractAddresses,
      eip712: this._eip712,
    };
  }

  /**
   * Deserialize from JSON
   */
  static fromJSON(json: unknown) {
    const data = typeof json === 'string' ? JSON.parse(json) : json;
    return new FhevmDecryptionSignature(data as any);
  }

  /**
   * Check if two signatures are equal
   */
  equals(s: FhevmDecryptionSignatureType) {
    return s.signature === this._signature;
  }

  /**
   * Check if signature is still valid (not expired)
   */
  isValid(): boolean {
    return timestampNow() < this._startTimestamp + this._durationDays * 24 * 60 * 60;
  }

  /**
   * Save signature to storage
   */
  async saveToStorage(
    storage: StorageAdapter,
    instance: FhevmInstance,
    withPublicKey: boolean
  ): Promise<void> {
    try {
      const value = JSON.stringify(this);

      const storageKey = new FhevmDecryptionSignatureStorageKey(
        instance,
        this._contractAddresses,
        this._userAddress,
        withPublicKey ? this._publicKey : undefined
      );
      await storage.setItem(storageKey.key, value);
    } catch {
      // Ignore errors
    }
  }

  /**
   * Load signature from storage
   */
  static async loadFromStorage(
    storage: StorageAdapter,
    instance: FhevmInstance,
    contractAddresses: string[],
    userAddress: string,
    publicKey?: string
  ): Promise<FhevmDecryptionSignature | null> {
    try {
      const storageKey = new FhevmDecryptionSignatureStorageKey(
        instance,
        contractAddresses,
        userAddress,
        publicKey
      );

      const result = await storage.getItem(storageKey.key);

      if (!result) {
        return null;
      }

      try {
        const sig = FhevmDecryptionSignature.fromJSON(result);
        if (!sig.isValid()) {
          return null;
        }

        return sig;
      } catch {
        return null;
      }
    } catch {
      return null;
    }
  }

  /**
   * Create new decryption signature
   * @param instance FHEVM instance
   * @param contractAddresses Contract addresses to authorize
   * @param publicKey User's public key for decryption
   * @param privateKey User's private key for decryption
   * @param signer ethers.JsonRpcSigner for signing EIP-712 message
   */
  static async create(
    instance: FhevmInstance,
    contractAddresses: string[],
    publicKey: string,
    privateKey: string,
    signer: ethers.JsonRpcSigner
  ): Promise<FhevmDecryptionSignature | null> {
    try {
      const userAddress = (await signer.getAddress()) as `0x${string}`;
      const startTimestamp = timestampNow();
      const durationDays = 365;
      const eip712 = (instance as any).createEIP712(
        publicKey,
        contractAddresses,
        startTimestamp,
        durationDays
      );
      const signature = await (signer as any).signTypedData(
        eip712.domain,
        { UserDecryptRequestVerification: eip712.types.UserDecryptRequestVerification },
        eip712.message
      );
      return new FhevmDecryptionSignature({
        publicKey,
        privateKey,
        contractAddresses: contractAddresses as `0x${string}`[],
        startTimestamp,
        durationDays,
        signature,
        eip712: eip712 as EIP712Type,
        userAddress,
      });
    } catch {
      return null;
    }
  }

  /**
   * Load from storage or create new signature
   * @param instance FHEVM instance
   * @param contractAddresses Contract addresses to authorize
   * @param signer ethers.JsonRpcSigner for signing
   * @param storage StorageAdapter for caching
   * @param keyPair Optional keypair (if not provided, will be generated)
   */
  static async loadOrSign(
    instance: FhevmInstance,
    contractAddresses: string[],
    signer: ethers.JsonRpcSigner,
    storage: StorageAdapter,
    keyPair?: { publicKey: string; privateKey: string }
  ): Promise<FhevmDecryptionSignature | null> {
    const userAddress = (await signer.getAddress()) as `0x${string}`;

    const cached: FhevmDecryptionSignature | null =
      await FhevmDecryptionSignature.loadFromStorage(
        storage,
        instance,
        contractAddresses,
        userAddress,
        keyPair?.publicKey
      );

    if (cached) {
      return cached;
    }

    const { publicKey, privateKey } = keyPair ?? (instance as any).generateKeypair();

    const sig = await FhevmDecryptionSignature.create(
      instance,
      contractAddresses,
      publicKey,
      privateKey,
      signer
    );

    if (!sig) {
      return null;
    }

    await sig.saveToStorage(storage, instance, Boolean(keyPair?.publicKey));

    return sig;
  }
}
