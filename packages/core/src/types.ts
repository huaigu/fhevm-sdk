import type { Eip1193Provider } from 'ethers';

/**
 * Storage adapter interface for framework-agnostic storage
 */
export interface StorageAdapter {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
  clear(): Promise<void>;
}

/**
 * FHEVM instance status
 */
export type FhevmStatus = 'idle' | 'loading' | 'ready' | 'error';

/**
 * FHEVM configuration
 */
export interface FhevmConfig {
  /**
   * Optional storage adapter (defaults to in-memory storage)
   */
  storage?: StorageAdapter;

  /**
   * Mock chains configuration (chainId → RPC URL mapping)
   * Used for local development with Hardhat
   */
  mockChains?: Record<number, string>;
}

/**
 * Parameters for initializing FHEVM instance
 */
export interface InitParams {
  /**
   * Ethereum provider (EIP-1193) or RPC URL
   */
  provider: Eip1193Provider | string;

  /**
   * Optional chain ID (will be detected if not provided)
   */
  chainId?: number;
}

/**
 * Encrypted input types supported by FHEVM
 */
export type EncryptedType =
  | 'ebool'
  | 'euint8'
  | 'euint16'
  | 'euint32'
  | 'euint64'
  | 'euint128'
  | 'euint160'
  | 'euint256'
  | 'eaddress';

/**
 * Parameters for encrypting data
 */
export interface EncryptParams {
  /**
   * Value to encrypt
   */
  value: number | bigint | boolean | string;

  /**
   * Type of encrypted value
   */
  type: EncryptedType;

  /**
   * Contract address for encryption context
   */
  contractAddress: `0x${string}`;

  /**
   * User address for encryption context
   */
  userAddress: `0x${string}`;
}

/**
 * Result of encryption operation
 */
export interface EncryptResult {
  /**
   * Encrypted handles (typically one handle per value)
   */
  handles: Uint8Array[];

  /**
   * Input proof for verification
   */
  inputProof: Uint8Array;
}

/**
 * Request for decrypting a handle
 */
export interface DecryptRequest {
  /**
   * The encrypted handle to decrypt
   */
  handle: string;

  /**
   * Contract address that owns the encrypted data
   */
  contractAddress: `0x${string}`;
}

/**
 * Result of decryption operation
 */
export type DecryptResult = Record<string, string | bigint | boolean>;

/**
 * EIP-712 typed data for decryption signatures
 */
export interface EIP712Type {
  domain: {
    name: string;
    version: string;
    chainId: number;
    verifyingContract: string;
  };
  primaryType: string;
  types: Record<string, Array<{ name: string; type: string }>>;
  message: Record<string, unknown>;
}

/**
 * FHEVM instance interface (from relayer SDK)
 */
export interface FhevmInstance {
  createEncryptedInput(contractAddress: string, userAddress: string): unknown;
  getPublicKey(): string;
  getPublicParams(size: number): string;
  userDecrypt(
    requests: Array<{ handle: string; contractAddress: string }>,
    privateKey: string,
    publicKey: string,
    signature: string,
    contractAddresses: string[],
    userAddress: string,
    startTimestamp: number,
    durationDays: number
  ): Promise<Record<string, string | bigint | boolean>>;
}

/**
 * FHEVM instance configuration (from relayer SDK)
 */
export interface FhevmInstanceConfig {
  network: Eip1193Provider | string;
  publicKey?:
    | {
        id: string;
        data: Uint8Array;
      }
    | undefined;
  publicParams?:
    | {
        '2048': {
          publicParamsId: string;
          publicParams: Uint8Array;
        };
      }
    | null
    | undefined;
  aclContractAddress: `0x${string}`;
  kmsVerifierContractAddress: `0x${string}`;
  inputVerifierContractAddress: `0x${string}`;
}

/**
 * Decryption signature data
 */
export interface FhevmDecryptionSignatureType {
  publicKey: string;
  privateKey: string;
  signature: string;
  startTimestamp: number;
  durationDays: number;
  userAddress: `0x${string}`;
  contractAddresses: `0x${string}`[];
  eip712: EIP712Type;
}
