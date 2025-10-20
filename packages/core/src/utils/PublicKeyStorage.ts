import { FhevmIndexedDBStorage } from '../storage/FhevmIndexedDBStorage';

/**
 * Stored public key structure
 * Note: Using Uint8Array as in original implementation - IndexedDB supports it natively
 */
export interface FhevmStoredPublicKey {
  publicKeyId: string;
  publicKey: Uint8Array;
}

/**
 * Stored public params structure
 * Note: Using Uint8Array as in original implementation - IndexedDB supports it natively
 */
export interface FhevmStoredPublicParams {
  publicParamsId: string;
  publicParams: Uint8Array;
}

/**
 * Result type for public key retrieval
 */
export interface PublicKeyStorageResult {
  publicKey?: {
    id: string;
    data: Uint8Array;
  };
  publicParams: {
    '2048': FhevmStoredPublicParams;
  } | null;
}

/**
 * Public key storage using IndexedDB directly
 * Based on original fhevm-sdk-old implementation
 * Stores Uint8Array without JSON serialization
 */
export class PublicKeyStorage {
  private storage: FhevmIndexedDBStorage;

  constructor() {
    this.storage = new FhevmIndexedDBStorage();
  }

  /**
   * Get public key and params for an ACL address
   */
  async get(aclAddress: `0x${string}`): Promise<PublicKeyStorageResult> {
    const storedPublicKey = await this.storage.getPublicKey(aclAddress);
    const storedPublicParams = await this.storage.getPublicParams(aclAddress);

    const publicKeyData = storedPublicKey?.publicKey;
    const publicKeyId = storedPublicKey?.publicKeyId;
    const publicParams = storedPublicParams
      ? {
          '2048': storedPublicParams,
        }
      : null;

    let publicKey: { id: string; data: Uint8Array } | undefined = undefined;

    if (publicKeyId && publicKeyData) {
      publicKey = {
        id: publicKeyId,
        data: publicKeyData,
      };
    }

    return {
      ...(publicKey !== undefined && { publicKey }),
      publicParams,
    };
  }

  /**
   * Set public key and params for an ACL address
   */
  async set(
    aclAddress: `0x${string}`,
    publicKey: FhevmStoredPublicKey | null,
    publicParams: FhevmStoredPublicParams | null
  ): Promise<void> {
    if (publicKey) {
      await this.storage.setPublicKey(aclAddress, publicKey);
    }

    if (publicParams) {
      await this.storage.setPublicParams(aclAddress, publicParams);
    }
  }
}
