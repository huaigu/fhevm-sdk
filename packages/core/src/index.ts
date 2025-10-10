// Main client
export { FhevmClient, FhevmError, FhevmAbortError } from './FhevmClient';

// Types
export type {
  StorageAdapter,
  FhevmStatus,
  FhevmConfig,
  InitParams,
  EncryptParams,
  EncryptResult,
  EncryptedType,
  DecryptRequest,
  DecryptResult,
  FhevmInstance,
  FhevmInstanceConfig,
  FhevmDecryptionSignatureType,
  EIP712Type,
} from './types';

// Storage implementations
export { MemoryStorage, IndexedDBStorage, LocalStorageStorage } from './storage';

// Utilities (for advanced use cases)
export {
  RelayerSDKLoader,
  isFhevmWindow,
  PublicKeyStorage,
  FhevmDecryptionSignature,
  SDK_CDN_URL,
  DEFAULT_MOCK_CHAINS,
} from './utils';
export type { FhevmRelayerSDK, FhevmWindow } from './utils';
