import type { StorageAdapter } from '../types';

/**
 * Stored public key structure
 */
export interface FhevmStoredPublicKey {
  publicKeyId: string;
  publicKey: string;
}

/**
 * Stored public params structure
 */
export interface FhevmStoredPublicParams {
  publicParamsId: string;
  publicParams: string;
}

/**
 * Result type for public key retrieval
 */
export interface PublicKeyStorageResult {
  publicKey?: {
    id: string;
    data: string;
  };
  publicParams: {
    '2048': FhevmStoredPublicParams;
  } | null;
}

/**
 * Type guards and assertions
 */
function assertFhevmStoredPublicKey(
  value: unknown
): asserts value is FhevmStoredPublicKey | null {
  if (typeof value !== 'object') {
    throw new Error('FhevmStoredPublicKey must be an object');
  }
  if (value === null) {
    return;
  }
  if (!('publicKeyId' in value)) {
    throw new Error('FhevmStoredPublicKey.publicKeyId does not exist');
  }
  if (typeof value.publicKeyId !== 'string') {
    throw new Error('FhevmStoredPublicKey.publicKeyId must be a string');
  }
  if (!('publicKey' in value)) {
    throw new Error('FhevmStoredPublicKey.publicKey does not exist');
  }
  if (typeof value.publicKey !== 'string') {
    throw new Error('FhevmStoredPublicKey.publicKey must be a string');
  }
}

function assertFhevmStoredPublicParams(
  value: unknown
): asserts value is FhevmStoredPublicParams | null {
  if (typeof value !== 'object') {
    throw new Error('FhevmStoredPublicParams must be an object');
  }
  if (value === null) {
    return;
  }
  if (!('publicParamsId' in value)) {
    throw new Error('FhevmStoredPublicParams.publicParamsId does not exist');
  }
  if (typeof value.publicParamsId !== 'string') {
    throw new Error('FhevmStoredPublicParams.publicParamsId must be a string');
  }
  if (!('publicParams' in value)) {
    throw new Error('FhevmStoredPublicParams.publicParams does not exist');
  }
  if (typeof value.publicParams !== 'string') {
    throw new Error('FhevmStoredPublicParams.publicParams must be a string');
  }
}

/**
 * Framework-agnostic public key storage using StorageAdapter
 * Stores public keys and params for ACL addresses
 */
export class PublicKeyStorage {
  private storage: StorageAdapter;

  constructor(storage: StorageAdapter) {
    this.storage = storage;
  }

  /**
   * Get public key and params for an ACL address
   */
  async get(aclAddress: `0x${string}`): Promise<PublicKeyStorageResult> {
    const publicKeyKey = `fhevm:publicKey:${aclAddress}`;
    const publicParamsKey = `fhevm:publicParams:${aclAddress}`;

    let storedPublicKey: FhevmStoredPublicKey | null = null;
    try {
      const pkJson = await this.storage.getItem(publicKeyKey);
      if (pkJson) {
        const pk = JSON.parse(pkJson);
        assertFhevmStoredPublicKey(pk);
        storedPublicKey = pk;
      }
    } catch {
      // Ignore errors
    }

    let storedPublicParams: FhevmStoredPublicParams | null = null;
    try {
      const ppJson = await this.storage.getItem(publicParamsKey);
      if (ppJson) {
        const pp = JSON.parse(ppJson);
        assertFhevmStoredPublicParams(pp);
        storedPublicParams = pp;
      }
    } catch {
      // Ignore errors
    }

    const publicKeyData = storedPublicKey?.publicKey;
    const publicKeyId = storedPublicKey?.publicKeyId;
    const publicParams = storedPublicParams
      ? {
          '2048': storedPublicParams,
        }
      : null;

    let publicKey: { id: string; data: string } | undefined = undefined;

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
    assertFhevmStoredPublicKey(publicKey);
    assertFhevmStoredPublicParams(publicParams);

    const publicKeyKey = `fhevm:publicKey:${aclAddress}`;
    const publicParamsKey = `fhevm:publicParams:${aclAddress}`;

    if (publicKey) {
      await this.storage.setItem(publicKeyKey, JSON.stringify(publicKey));
    }

    if (publicParams) {
      await this.storage.setItem(publicParamsKey, JSON.stringify(publicParams));
    }
  }
}
