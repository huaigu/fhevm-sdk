# @0xbojack/fhevm-vue

## 0.2.0

### Minor Changes

- Initial public release of FHEVM SDK packages

  **@0xbojack/fhevm-core** - Framework-agnostic FHEVM client
  - Fully Homomorphic Encryption for blockchain privacy
  - Flexible storage adapters (Memory, localStorage, IndexedDB)
  - EIP-712 signature caching for 365-day decryption authorization
  - Mock support for local Hardhat development
  - Tree-shakeable ESM + CJS builds with TypeScript declarations

  **@0xbojack/fhevm-react** - React hooks for FHEVM
  - wagmi-like hooks: useInit, useStatus, useEncrypt, useDecrypt, usePublicKey
  - FhevmProvider context for easy setup
  - Auto-cancellation and cleanup on unmount
  - Full TypeScript support with comprehensive types
  - Built on @0xbojack/fhevm-core for framework-agnostic foundation

  **@0xbojack/fhevm-vue** - Vue 3 composables for FHEVM
  - Composition API: useInit, useStatus, useEncrypt, useDecrypt, usePublicKey
  - Vue plugin system with createFhevm()
  - Reactive state management with Vue refs
  - Auto-cleanup on component unmount
  - Full TypeScript support with comprehensive types
  - Built on @0xbojack/fhevm-core for framework-agnostic foundation

  All packages ready for production use with comprehensive documentation, examples, and test coverage.

### Patch Changes

- Updated dependencies
  - @0xbojack/fhevm-core@0.2.0
