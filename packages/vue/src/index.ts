// Plugin
export { createFhevm, useFhevmClient, FhevmClientKey } from './plugin';
export type { FhevmPluginOptions } from './plugin';

// Composables
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
} from '@fhevm/core';

// Re-export storage adapters
export { MemoryStorage, IndexedDBStorage, LocalStorageStorage } from '@fhevm/core';
