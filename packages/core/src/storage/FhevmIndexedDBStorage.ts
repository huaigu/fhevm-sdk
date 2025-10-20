import type { FhevmStoredPublicKey, FhevmStoredPublicParams } from '../utils/PublicKeyStorage';

/**
 * Specialized IndexedDB storage for FHEVM public keys and params
 * Stores Uint8Array directly without JSON serialization (IndexedDB supports it natively)
 *
 * This is based on the original fhevm-sdk-old implementation
 */

interface FhevmDB {
  publicKeyStore: {
    key: string;
    value: {
      acl: `0x${string}`;
      value: FhevmStoredPublicKey;
    };
  };
  paramsStore: {
    key: string;
    value: {
      acl: `0x${string}`;
      value: FhevmStoredPublicParams;
    };
  };
}

export class FhevmIndexedDBStorage {
  private dbName = 'fhevm';
  private dbVersion = 1;
  private dbPromise: Promise<IDBDatabase> | null = null;

  private async getDB(): Promise<IDBDatabase> {
    if (this.dbPromise) {
      return this.dbPromise;
    }

    this.dbPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains('paramsStore')) {
          db.createObjectStore('paramsStore', { keyPath: 'acl' });
        }
        if (!db.objectStoreNames.contains('publicKeyStore')) {
          db.createObjectStore('publicKeyStore', { keyPath: 'acl' });
        }
      };
    });

    return this.dbPromise;
  }

  private async withStore<T>(
    storeName: string,
    mode: IDBTransactionMode,
    callback: (store: IDBObjectStore) => IDBRequest<T>
  ): Promise<T> {
    const db = await this.getDB();
    const transaction = db.transaction(storeName, mode);
    const store = transaction.objectStore(storeName);
    const request = callback(store);

    return new Promise((resolve, reject) => {
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  }

  async getPublicKey(aclAddress: `0x${string}`): Promise<FhevmStoredPublicKey | null> {
    try {
      const result = await this.withStore('publicKeyStore', 'readonly', (store) =>
        store.get(aclAddress)
      );
      return result?.value ?? null;
    } catch {
      return null;
    }
  }

  async setPublicKey(aclAddress: `0x${string}`, value: FhevmStoredPublicKey): Promise<void> {
    await this.withStore('publicKeyStore', 'readwrite', (store) =>
      store.put({ acl: aclAddress, value })
    );
  }

  async getPublicParams(aclAddress: `0x${string}`): Promise<FhevmStoredPublicParams | null> {
    try {
      const result = await this.withStore('paramsStore', 'readonly', (store) =>
        store.get(aclAddress)
      );
      return result?.value ?? null;
    } catch {
      return null;
    }
  }

  async setPublicParams(aclAddress: `0x${string}`, value: FhevmStoredPublicParams): Promise<void> {
    await this.withStore('paramsStore', 'readwrite', (store) =>
      store.put({ acl: aclAddress, value })
    );
  }

  async clear(): Promise<void> {
    const db = await this.getDB();
    const transaction = db.transaction(['publicKeyStore', 'paramsStore'], 'readwrite');
    await Promise.all([
      new Promise<void>((resolve, reject) => {
        const req = transaction.objectStore('publicKeyStore').clear();
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      }),
      new Promise<void>((resolve, reject) => {
        const req = transaction.objectStore('paramsStore').clear();
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      }),
    ]);
  }
}
