import { describe, it, expect, beforeEach, vi } from 'vitest';
import { FhevmClient, FhevmError, FhevmAbortError } from '../src/FhevmClient';
import { MemoryStorage } from '../src/storage';

describe('FhevmClient', () => {
  let client: FhevmClient;

  beforeEach(() => {
    client = new FhevmClient({
      storage: new MemoryStorage(),
    });
  });

  describe('constructor', () => {
    it('should create client with default config', () => {
      const defaultClient = new FhevmClient();
      expect(defaultClient.getStatus()).toBe('idle');
    });

    it('should create client with custom storage', () => {
      const storage = new MemoryStorage();
      const customClient = new FhevmClient({ storage });
      expect(customClient.getStatus()).toBe('idle');
    });
  });

  describe('getStatus', () => {
    it('should return initial status as idle', () => {
      expect(client.getStatus()).toBe('idle');
    });
  });

  describe('onStatusChange', () => {
    it('should subscribe to status changes', () => {
      const listener = vi.fn();
      const unsubscribe = client.onStatusChange(listener);
      expect(typeof unsubscribe).toBe('function');
    });

    it('should unsubscribe from status changes', () => {
      const listener = vi.fn();
      const unsubscribe = client.onStatusChange(listener);
      unsubscribe();
      // Status change should not trigger listener after unsubscribe
      expect(listener).not.toHaveBeenCalled();
    });
  });

  describe('getInstance', () => {
    it('should throw error if not initialized', () => {
      expect(() => client.getInstance()).toThrow(FhevmError);
      expect(() => client.getInstance()).toThrow('NOT_INITIALIZED');
    });
  });

  describe('getPublicKey', () => {
    it('should throw error if not initialized', () => {
      expect(() => client.getPublicKey()).toThrow(FhevmError);
      expect(() => client.getPublicKey()).toThrow('NOT_INITIALIZED');
    });
  });

  describe('encrypt', () => {
    it('should throw error if not initialized', async () => {
      await expect(
        client.encrypt({
          value: 42,
          type: 'euint32',
          contractAddress: '0x1234567890123456789012345678901234567890',
          userAddress: '0x1234567890123456789012345678901234567890',
        })
      ).rejects.toThrow(FhevmError);
    });
  });

  describe('decrypt', () => {
    it('should throw error if not initialized', async () => {
      const mockSigner = {} as any;
      await expect(
        client.decrypt(
          [
            {
              handle: '0x1234',
              contractAddress: '0x1234567890123456789012345678901234567890',
            },
          ],
          mockSigner
        )
      ).rejects.toThrow(FhevmError);
    });
  });
});

describe('FhevmError', () => {
  it('should create error with code and message', () => {
    const error = new FhevmError('TEST_CODE', 'Test message');
    expect(error.code).toBe('TEST_CODE');
    expect(error.message).toBe('Test message');
    expect(error.name).toBe('FhevmError');
  });

  it('should create error with cause', () => {
    const cause = new Error('Original error');
    const error = new FhevmError('TEST_CODE', 'Test message', { cause });
    expect(error.cause).toBe(cause);
  });
});

describe('FhevmAbortError', () => {
  it('should create abort error with default message', () => {
    const error = new FhevmAbortError();
    expect(error.message).toBe('FHEVM operation was cancelled');
    expect(error.name).toBe('FhevmAbortError');
  });

  it('should create abort error with custom message', () => {
    const error = new FhevmAbortError('Custom abort message');
    expect(error.message).toBe('Custom abort message');
  });
});
