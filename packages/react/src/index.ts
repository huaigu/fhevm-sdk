// Context and Provider
export { FhevmProvider, useFhevmContext } from './FhevmContext';
export type { FhevmContextValue, FhevmProviderProps } from './FhevmContext';

// Hooks
export { useInit } from './useInit';
export type { UseInitReturn } from './useInit';

export { useEncrypt } from './useEncrypt';
export type { UseEncryptReturn } from './useEncrypt';

export { useDecrypt } from './useDecrypt';
export type { UseDecryptReturn } from './useDecrypt';

export { usePublicKey } from './usePublicKey';
export type { UsePublicKeyReturn } from './usePublicKey';

export { useStatus } from './useStatus';
export type { UseStatusReturn } from './useStatus';

// Re-export core types for convenience
export type {
  FhevmConfig,
  FhevmStatus,
  InitParams,
  EncryptParams,
  EncryptResult,
  EncryptedType,
  DecryptRequest,
  DecryptResult,
  StorageAdapter,
} from '@0xbojack/fhevm-core';

// Re-export storage adapters
export { MemoryStorage, IndexedDBStorage, LocalStorageStorage } from '@0xbojack/fhevm-core';
