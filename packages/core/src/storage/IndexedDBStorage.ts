import type { StorageAdapter } from '../types';

/**
 * IndexedDB storage implementation for browser environments
 * Provides persistent storage with better capacity than localStorage
 *
 * Note: Unlike localStorage, IndexedDB can store complex objects including Uint8Array
 * We store values as-is without JSON stringification to preserve Uint8Array
 */
export class IndexedDBStorage implements StorageAdapter {
  private dbName = 'fhevm-storage';
  private storeName = 'keyval';
  private dbPromise: Promise<IDBDatabase> | null = null;

  private async getDB(): Promise<IDBDatabase> {
    if (this.dbPromise) {
      return this.dbPromise;
    }

    this.dbPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, 1);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(this.storeName)) {
          db.createObjectStore(this.storeName);
        }
      };
    });

    return this.dbPromise;
  }

  private async withStore<T>(
    mode: IDBTransactionMode,
    callback: (store: IDBObjectStore) => IDBRequest<T>
  ): Promise<T> {
    const db = await this.getDB();
    const transaction = db.transaction(this.storeName, mode);
    const store = transaction.objectStore(this.storeName);
    const request = callback(store);

    return new Promise((resolve, reject) => {
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  }

  async getItem(key: string): Promise<string | null> {
    const value = await this.withStore('readonly', (store) => store.get(key));
    return value ?? null;
  }

  async setItem(key: string, value: string): Promise<void> {
    await this.withStore('readwrite', (store) => store.put(value, key));
  }

  async removeItem(key: string): Promise<void> {
    await this.withStore('readwrite', (store) => store.delete(key));
  }

  async clear(): Promise<void> {
    await this.withStore('readwrite', (store) => store.clear());
  }
}
