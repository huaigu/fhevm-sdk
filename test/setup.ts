// Global test setup for Vitest
import { vi } from 'vitest';

// Mock IndexedDB for browser environment tests
if (typeof global.indexedDB === 'undefined') {
  const { default: fakeIndexedDB } = await import('fake-indexeddb');
  global.indexedDB = fakeIndexedDB;
}

// Mock console methods to reduce test noise (optional)
global.console = {
  ...console,
  log: vi.fn(),
  debug: vi.fn(),
  info: vi.fn(),
  warn: vi.fn(),
};
