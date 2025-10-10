import type { StorageAdapter } from '../types';

/**
 * In-memory storage implementation for Node.js and testing environments
 * Data is stored in a Map and persists only for the lifetime of the instance
 */
export class MemoryStorage implements StorageAdapter {
  private store: Map<string, string> = new Map();

  async getItem(key: string): Promise<string | null> {
    return this.store.get(key) ?? null;
  }

  async setItem(key: string, value: string): Promise<void> {
    this.store.set(key, value);
  }

  async removeItem(key: string): Promise<void> {
    this.store.delete(key);
  }

  async clear(): Promise<void> {
    this.store.clear();
  }
}
