import type { StorageAdapter } from '../types';

/**
 * LocalStorage storage implementation for browser environments
 * Simpler alternative to IndexedDB with synchronous API wrapped in async
 */
export class LocalStorageStorage implements StorageAdapter {
  private prefix: string;

  constructor(prefix = 'fhevm:') {
    this.prefix = prefix;
  }

  private getKey(key: string): string {
    return `${this.prefix}${key}`;
  }

  async getItem(key: string): Promise<string | null> {
    try {
      return localStorage.getItem(this.getKey(key));
    } catch (error) {
      console.error('LocalStorage getItem error:', error);
      return null;
    }
  }

  async setItem(key: string, value: string): Promise<void> {
    try {
      localStorage.setItem(this.getKey(key), value);
    } catch (error) {
      console.error('LocalStorage setItem error:', error);
      throw error;
    }
  }

  async removeItem(key: string): Promise<void> {
    try {
      localStorage.removeItem(this.getKey(key));
    } catch (error) {
      console.error('LocalStorage removeItem error:', error);
    }
  }

  async clear(): Promise<void> {
    try {
      const keys = Object.keys(localStorage);
      for (const key of keys) {
        if (key.startsWith(this.prefix)) {
          localStorage.removeItem(key);
        }
      }
    } catch (error) {
      console.error('LocalStorage clear error:', error);
    }
  }
}
