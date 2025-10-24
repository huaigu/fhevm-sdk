import { describe, it, expect } from 'vitest';
import { createApp } from 'vue';
import { createFhevm, useFhevmClient } from '../src/plugin';
import { MemoryStorage } from '@0xbojack/fhevm-core';

describe('createFhevm', () => {
  it('should create plugin with default config', () => {
    const plugin = createFhevm();
    expect(plugin).toBeDefined();
    expect(plugin.install).toBeInstanceOf(Function);
  });

  it('should create plugin with custom config', () => {
    const storage = new MemoryStorage();
    const plugin = createFhevm({ config: { storage } });
    expect(plugin).toBeDefined();
  });

  it('should provide client to app', () => {
    const app = createApp({
      setup() {
        const client = useFhevmClient();
        expect(client).toBeDefined();
        return {};
      },
      template: '<div>Test</div>',
    });

    const plugin = createFhevm();
    app.use(plugin);
  });

  it('should throw error when used outside app', () => {
    expect(() => useFhevmClient()).toThrow(
      'useFhevmClient must be used in a Vue app with FHEVM plugin installed'
    );
  });
});
