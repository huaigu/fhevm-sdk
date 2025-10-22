'use client'

/**
 * Next.js adapter for FHEVM SDK
 *
 * This package re-exports all hooks from @0xbojack/fhevm-react with
 * the 'use client' directive already applied, so Next.js users don't
 * need to manually add it to their components.
 *
 * @example
 * ```tsx
 * // No need for 'use client' directive!
 * import { FhevmProvider, useInit, useEncrypt, useDecrypt } from '@0xbojack/fhevm-nextjs'
 *
 * export default function MyComponent() {
 *   const { init, isLoading } = useInit()
 *   const { encrypt, isEncrypting } = useEncrypt()
 *
 *   return <div>...</div>
 * }
 * ```
 */

// Re-export all hooks and utilities from @0xbojack/fhevm-react
export {
  FhevmProvider,
  useFhevmContext,
  useInit,
  useEncrypt,
  useDecrypt,
  usePublicKey,
  useStatus,
  MemoryStorage,
  IndexedDBStorage,
  LocalStorageStorage,
} from '@0xbojack/fhevm-react'

// Re-export types
export type {
  FhevmContextValue,
  FhevmProviderProps,
  UseInitReturn,
  UseEncryptReturn,
  UseDecryptReturn,
  UsePublicKeyReturn,
  UseStatusReturn,
  FhevmConfig,
  FhevmStatus,
  InitParams,
  EncryptParams,
  EncryptResult,
  EncryptedType,
  DecryptRequest,
  DecryptResult,
  StorageAdapter,
} from '@0xbojack/fhevm-react'
