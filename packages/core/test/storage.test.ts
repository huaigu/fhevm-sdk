import { describe, it, expect, beforeEach } from 'vitest';
import { MemoryStorage, LocalStorageStorage, IndexedDBStorage } from '../src/storage';

describe('MemoryStorage', () => {
  let storage: MemoryStorage;

  beforeEach(() => {
    storage = new MemoryStorage();
  });

  it('should store and retrieve items', async () => {
    await storage.setItem('key1', 'value1');
    const value = await storage.getItem('key1');
    expect(value).toBe('value1');
  });

  it('should return null for non-existent keys', async () => {
    const value = await storage.getItem('nonexistent');
    expect(value).toBeNull();
  });

  it('should remove items', async () => {
    await storage.setItem('key1', 'value1');
    await storage.removeItem('key1');
    const value = await storage.getItem('key1');
    expect(value).toBeNull();
  });

  it('should clear all items', async () => {
    await storage.setItem('key1', 'value1');
    await storage.setItem('key2', 'value2');
    await storage.clear();
    const value1 = await storage.getItem('key1');
    const value2 = await storage.getItem('key2');
    expect(value1).toBeNull();
    expect(value2).toBeNull();
  });

  it('should handle multiple items', async () => {
    await storage.setItem('key1', 'value1');
    await storage.setItem('key2', 'value2');
    await storage.setItem('key3', 'value3');
    expect(await storage.getItem('key1')).toBe('value1');
    expect(await storage.getItem('key2')).toBe('value2');
    expect(await storage.getItem('key3')).toBe('value3');
  });

  it('should overwrite existing values', async () => {
    await storage.setItem('key1', 'value1');
    await storage.setItem('key1', 'value2');
    const value = await storage.getItem('key1');
    expect(value).toBe('value2');
  });
});

describe('LocalStorageStorage', () => {
  let storage: LocalStorageStorage;

  beforeEach(() => {
    localStorage.clear();
    storage = new LocalStorageStorage('test:');
  });

  it('should store and retrieve items with prefix', async () => {
    await storage.setItem('key1', 'value1');
    const value = await storage.getItem('key1');
    expect(value).toBe('value1');
    // Check that localStorage has the prefixed key
    expect(localStorage.getItem('test:key1')).toBe('value1');
  });

  it('should return null for non-existent keys', async () => {
    const value = await storage.getItem('nonexistent');
    expect(value).toBeNull();
  });

  it('should remove items', async () => {
    await storage.setItem('key1', 'value1');
    await storage.removeItem('key1');
    const value = await storage.getItem('key1');
    expect(value).toBeNull();
  });

  it('should clear only prefixed items', async () => {
    // Add non-prefixed item
    localStorage.setItem('other:key', 'other');
    // Add prefixed items
    await storage.setItem('key1', 'value1');
    await storage.setItem('key2', 'value2');
    await storage.clear();
    // Prefixed items should be cleared
    expect(await storage.getItem('key1')).toBeNull();
    expect(await storage.getItem('key2')).toBeNull();
    // Non-prefixed item should remain
    expect(localStorage.getItem('other:key')).toBe('other');
  });

  it('should use default prefix', async () => {
    const defaultStorage = new LocalStorageStorage();
    await defaultStorage.setItem('key1', 'value1');
    expect(localStorage.getItem('fhevm:key1')).toBe('value1');
  });
});

describe('IndexedDBStorage', () => {
  let storage: IndexedDBStorage;

  beforeEach(async () => {
    // Delete existing database
    const databases = await indexedDB.databases();
    for (const db of databases) {
      if (db.name === 'fhevm-storage') {
        indexedDB.deleteDatabase(db.name);
      }
    }
    storage = new IndexedDBStorage();
  });

  it('should store and retrieve items', async () => {
    await storage.setItem('key1', 'value1');
    const value = await storage.getItem('key1');
    expect(value).toBe('value1');
  });

  it('should return null for non-existent keys', async () => {
    const value = await storage.getItem('nonexistent');
    expect(value).toBeNull();
  });

  it('should remove items', async () => {
    await storage.setItem('key1', 'value1');
    await storage.removeItem('key1');
    const value = await storage.getItem('key1');
    expect(value).toBeNull();
  });

  it('should clear all items', async () => {
    await storage.setItem('key1', 'value1');
    await storage.setItem('key2', 'value2');
    await storage.clear();
    const value1 = await storage.getItem('key1');
    const value2 = await storage.getItem('key2');
    expect(value1).toBeNull();
    expect(value2).toBeNull();
  });

  it('should handle multiple items', async () => {
    await storage.setItem('key1', 'value1');
    await storage.setItem('key2', 'value2');
    await storage.setItem('key3', 'value3');
    expect(await storage.getItem('key1')).toBe('value1');
    expect(await storage.getItem('key2')).toBe('value2');
    expect(await storage.getItem('key3')).toBe('value3');
  });

  it('should persist across instances', async () => {
    await storage.setItem('key1', 'value1');
    const newStorage = new IndexedDBStorage();
    const value = await newStorage.getItem('key1');
    expect(value).toBe('value1');
  });
});
