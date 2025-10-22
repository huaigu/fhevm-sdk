# @fhevm/core

Framework-agnostic FHEVM SDK core library for building privacy-preserving applications with Fully Homomorphic Encryption.

## Features

- 🔒 **Fully Homomorphic Encryption**: Compute on encrypted data without decryption
- 🎯 **Framework Agnostic**: Works with any JavaScript framework or vanilla JS
- 💾 **Flexible Storage**: Built-in support for Memory, localStorage, and IndexedDB
- 🔐 **EIP-712 Signatures**: Secure 365-day decryption authorization caching
- 🧪 **Mock Support**: Local development with Hardhat using `@fhevm/mock-utils`
- 📦 **Tree-shakeable**: Optimized bundle size with ESM and CJS builds

## Installation

```bash
npm install @fhevm/core ethers
# or
pnpm add @fhevm/core ethers
# or
yarn add @fhevm/core ethers
```

For local development with Hardhat:
```bash
npm install -D @fhevm/mock-utils
```

## Quick Start

### Basic Usage

```typescript
import { FhevmClient } from '@fhevm/core';
import { BrowserProvider } from 'ethers';

// Create client
const client = new FhevmClient();

// Initialize with provider
const provider = new BrowserProvider(window.ethereum);
await client.init({ provider });

// Encrypt data
const encrypted = await client.encrypt({
  value: 42,
  type: 'euint32',
  contractAddress: '0x...',
  userAddress: '0x...',
});

// Decrypt data (requires signer)
const signer = await provider.getSigner();
const decrypted = await client.decrypt(
  [{ handle: '0x...', contractAddress: '0x...' }],
  signer
);
```

### Custom Storage

```typescript
import { FhevmClient, IndexedDBStorage } from '@fhevm/core';

const client = new FhevmClient({
  storage: new IndexedDBStorage(), // Persistent browser storage
});
```

### Local Development (Hardhat)

```typescript
import { FhevmClient } from '@fhevm/core';

const client = new FhevmClient({
  mockChains: {
    31337: 'http://localhost:8545', // Hardhat local network
  },
});

await client.init({
  provider: 'http://localhost:8545',
  chainId: 31337,
});
```

## API Reference

### FhevmClient

#### Constructor

```typescript
new FhevmClient(config?: FhevmConfig)
```

**Config Options:**
- `storage?: StorageAdapter` - Custom storage implementation (default: MemoryStorage)
- `mockChains?: Record<number, string>` - Mock chain configurations for local development

#### Methods

##### `init(params: InitParams, signal?: AbortSignal): Promise<FhevmInstance>`

Initialize the FHEVM instance.

**Parameters:**
- `params.provider: Eip1193Provider | string` - Ethereum provider or RPC URL
- `params.chainId?: number` - Chain ID (auto-detected if not provided)
- `signal?: AbortSignal` - Optional abort signal for cancellation

**Returns:** Promise<FhevmInstance>

##### `getStatus(): FhevmStatus`

Get current initialization status.

**Returns:** `'idle' | 'loading' | 'ready' | 'error'`

##### `onStatusChange(listener: (status: FhevmStatus) => void): () => void`

Subscribe to status changes.

**Returns:** Unsubscribe function

##### `getPublicKey(): string`

Get the public key for encryption.

**Returns:** Public key string

##### `encrypt(params: EncryptParams): Promise<EncryptResult>`

Encrypt data for on-chain computation.

**Parameters:**
- `value: number | bigint | boolean | string` - Value to encrypt
- `type: EncryptedType` - Type of encrypted value
- `contractAddress: 0x${string}` - Contract address
- `userAddress: 0x${string}` - User address

**Supported Types:**
- `ebool` - Encrypted boolean
- `euint8` - Encrypted 8-bit unsigned integer
- `euint16` - Encrypted 16-bit unsigned integer
- `euint32` - Encrypted 32-bit unsigned integer
- `euint64` - Encrypted 64-bit unsigned integer
- `euint128` - Encrypted 128-bit unsigned integer
- `euint160` - Encrypted 160-bit unsigned integer
- `euint256` - Encrypted 256-bit unsigned integer
- `eaddress` - Encrypted address

**Returns:** `{ handles: Uint8Array[], inputProof: Uint8Array }`

##### `decrypt(requests: DecryptRequest[], signer: JsonRpcSigner): Promise<DecryptResult>`

Decrypt encrypted data (requires user signature).

**Parameters:**
- `requests` - Array of decrypt requests
- `signer` - ethers.JsonRpcSigner for EIP-712 signature

**Returns:** Decrypted values as Record<string, string | bigint | boolean>

## Storage Adapters

### MemoryStorage (Default)

In-memory storage, data persists only for the lifetime of the instance.

```typescript
import { MemoryStorage } from '@fhevm/core';
const storage = new MemoryStorage();
```

### LocalStorageStorage

Browser localStorage with prefix support.

```typescript
import { LocalStorageStorage } from '@fhevm/core';
const storage = new LocalStorageStorage('my-app:'); // Optional prefix
```

### IndexedDBStorage

Browser IndexedDB for larger storage capacity.

```typescript
import { IndexedDBStorage } from '@fhevm/core';
const storage = new IndexedDBStorage();
```

### Custom Storage

Implement the `StorageAdapter` interface:

```typescript
interface StorageAdapter {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
  clear(): Promise<void>;
}
```

## Error Handling

```typescript
import { FhevmError, FhevmAbortError } from '@fhevm/core';

try {
  await client.init({ provider });
} catch (error) {
  if (error instanceof FhevmAbortError) {
    console.log('Operation was cancelled');
  } else if (error instanceof FhevmError) {
    console.error('FHEVM Error:', error.code, error.message);
  }
}
```

## TypeScript Support

Full TypeScript support with comprehensive type definitions.

```typescript
import type {
  FhevmConfig,
  FhevmStatus,
  InitParams,
  EncryptParams,
  EncryptResult,
  DecryptRequest,
  DecryptResult,
  StorageAdapter,
} from '@fhevm/core';
```

## Advanced Usage

### Abort Operations

```typescript
const controller = new AbortController();

// Start initialization
const initPromise = client.init({ provider }, controller.signal);

// Cancel if needed
controller.abort();

try {
  await initPromise;
} catch (error) {
  if (error instanceof FhevmAbortError) {
    console.log('Initialization cancelled');
  }
}
```

### Status Monitoring

```typescript
const unsubscribe = client.onStatusChange((status) => {
  console.log('Status:', status);
  // idle -> loading -> ready
});

await client.init({ provider });
unsubscribe();
```

### Multiple Contract Decryption

```typescript
const results = await client.decrypt(
  [
    { handle: '0x...', contractAddress: '0xContract1...' },
    { handle: '0x...', contractAddress: '0xContract2...' },
  ],
  signer
);
```

### Batch Encryption

```typescript
// Encrypt multiple values for the same contract
const client = new FhevmClient();
await client.init({ provider });

const contractAddress = '0x...';
const userAddress = '0x...';

// Encrypt multiple values
const age = await client.encrypt({
  value: 25,
  type: 'euint8',
  contractAddress,
  userAddress,
});

const balance = await client.encrypt({
  value: 1000n,
  type: 'euint64',
  contractAddress,
  userAddress,
});

const isActive = await client.encrypt({
  value: true,
  type: 'ebool',
  contractAddress,
  userAddress,
});

// Use in contract call
await contract.setUserData(
  age.handles[0],
  balance.handles[0],
  isActive.handles[0],
  age.inputProof // All values share the same proof
);
```

### Custom Error Handling

```typescript
import { FhevmClient, FhevmError, FhevmAbortError } from '@fhevm/core';

try {
  await client.encrypt({ value: 42, type: 'euint32', contractAddress, userAddress });
} catch (error) {
  if (error instanceof FhevmAbortError) {
    console.log('Operation cancelled by user');
  } else if (error instanceof FhevmError) {
    switch (error.code) {
      case 'NOT_INITIALIZED':
        console.error('Client not initialized - call init() first');
        break;
      case 'INVALID_TYPE':
        console.error('Invalid encrypted type provided');
        break;
      case 'BROWSER_REQUIRED':
        console.error('Browser environment required for production chains');
        break;
      default:
        console.error(`FHEVM Error (${error.code}):`, error.message);
    }
  } else {
    console.error('Unexpected error:', error);
  }
}
```

### Production Deployment Example

```typescript
import { FhevmClient, IndexedDBStorage } from '@fhevm/core';
import { BrowserProvider } from 'ethers';

// Production configuration
const client = new FhevmClient({
  storage: new IndexedDBStorage(), // Persistent storage
  mockChains: {}, // Disable mock chains in production
});

// Initialize with MetaMask/WalletConnect
const provider = new BrowserProvider(window.ethereum);
await client.init({ provider });

// Subscribe to status changes for UI feedback
client.onStatusChange((status) => {
  switch (status) {
    case 'loading':
      showLoadingSpinner();
      break;
    case 'ready':
      hideLoadingSpinner();
      enableEncryptButton();
      break;
    case 'error':
      hideLoadingSpinner();
      showErrorMessage();
      break;
  }
});
```

## Performance Best Practices

### 1. Optimize Encrypted Type Selection

Choose the smallest encrypted type that fits your data to minimize gas costs:

```typescript
// ❌ BAD: Using oversized type
const age = await client.encrypt({
  value: 25, // 0-255 range
  type: 'euint256', // Wastes gas
  contractAddress,
  userAddress,
});

// ✅ GOOD: Using appropriate type
const age = await client.encrypt({
  value: 25,
  type: 'euint8', // Perfect fit for 0-255 range
  contractAddress,
  userAddress,
});
```

### 2. Storage Adapter Selection

| Storage Type | Use Case | Persistence | Capacity | Performance |
|--------------|----------|-------------|----------|-------------|
| MemoryStorage | Testing, ephemeral sessions | Session only | Low (~5MB) | Fastest |
| LocalStorageStorage | Simple apps, small data | Browser restart | ~10MB | Fast |
| IndexedDBStorage | Production apps | Browser restart | ~50MB+ | Good |

**Recommendation**: Use `IndexedDBStorage` for production to cache public keys and signatures persistently.

### 3. Signature Reuse

Decryption signatures are valid for **365 days** and automatically cached:

```typescript
// First decrypt - prompts user to sign
const result1 = await client.decrypt([{ handle: '0x...', contractAddress }], signer);

// Subsequent decrypts within 365 days - no signature prompt!
const result2 = await client.decrypt([{ handle: '0x...', contractAddress }], signer);
const result3 = await client.decrypt([{ handle: '0x...', contractAddress }], signer);
```

**Impact**: Reduces user friction by 99% after initial signature.

### 4. Public Key Caching

Public keys are automatically cached using `PublicKeyStorage`:

- **First init**: Downloads public key from network (~1-2s)
- **Subsequent inits**: Loads from storage (<50ms)

**Recommendation**: Always use persistent storage (IndexedDB) to maximize cache hit rate across sessions.

### 5. Abort Long-Running Operations

Use `AbortController` to cancel initialization if user navigates away:

```typescript
const controller = new AbortController();

// Cancel on component unmount
useEffect(() => {
  const initPromise = client.init({ provider }, controller.signal);
  return () => controller.abort();
}, []);
```

## Troubleshooting

### MetaMask Nonce Mismatch After Hardhat Restart

**Symptom**: Transactions fail with "nonce too high" or "nonce too low" after restarting local Hardhat node.

**Solution**:
1. Open MetaMask → Settings → Advanced → **Clear Activity Tab Data**
2. Restart your browser (clears view function cache)
3. Reconnect to `http://localhost:8545`
4. Redeploy contracts with `pnpm contract:deploy`

### Public Key Not Found Error

**Symptom**: `FhevmError: Public key not found` during decryption.

**Causes & Solutions**:
- **Signature expired** (>365 days old): Re-initialize client
  ```typescript
  await client.init({ provider }); // Refreshes public key
  ```
- **Storage cleared**: Signature was deleted from browser storage
  ```typescript
  // User will be prompted to sign again
  await client.decrypt([...], signer);
  ```
- **Wrong contract address**: Signature is per-contract
  ```typescript
  // Generate new signature for new contract
  await client.decrypt(
    [{ handle: '0x...', contractAddress: '0xNEW_CONTRACT' }],
    signer
  );
  ```

### Mock Utils Not Found (Local Development)

**Symptom**: `Cannot find module '@fhevm/mock-utils'` when using Hardhat (chainId 31337).

**Solution**: Install as dev dependency:
```bash
npm install -D @fhevm/mock-utils
# or
pnpm add -D @fhevm/mock-utils
```

### Browser Environment Required

**Symptom**: `FhevmError: BROWSER_REQUIRED` when running on server.

**Explanation**: Production chains (Sepolia, mainnet) require browser environment to load Relayer SDK.

**Solutions**:
- **Next.js**: Use client components (`'use client'`) for FHEVM operations
- **Node.js backend**: Use mock chains for testing, or implement server-side decryption (advanced)
- **SSR**: Defer FHEVM initialization to `useEffect` (client-side only)

```typescript
'use client'; // Next.js client component

import { useEffect } from 'react';
import { FhevmClient } from '@fhevm/core';

export function EncryptForm() {
  useEffect(() => {
    // Client-side only
    const client = new FhevmClient();
    client.init({ provider: window.ethereum });
  }, []);
}
```

### ChainId Mismatch

**Symptom**: Client initializes but encryption fails.

**Cause**: Provider and config chainId don't match.

**Solution**: Let the SDK auto-detect chainId:
```typescript
// ❌ BAD: Manual chainId may mismatch
await client.init({ provider: window.ethereum, chainId: 11155111 });

// ✅ GOOD: Auto-detect from provider
await client.init({ provider: window.ethereum });
```

### Slow Initialization

**Symptom**: `init()` takes >5 seconds on subsequent loads.

**Causes**:
1. **No persistent storage**: Using `MemoryStorage` (default)
   - **Solution**: Switch to `IndexedDBStorage`
2. **Network latency**: Downloading public key every time
   - **Solution**: Verify storage adapter is working
3. **Relayer SDK loading**: CDN download on first load
   - **Expected**: First load slower (~2-3s), subsequent loads fast

```typescript
// Enable persistent caching
const client = new FhevmClient({
  storage: new IndexedDBStorage(),
});

// Verify caching works
console.time('First init');
await client.init({ provider });
console.timeEnd('First init'); // ~2000ms

console.time('Second init');
await client.init({ provider });
console.timeEnd('Second init'); // ~50ms (cached!)
```

## Migration Guide

### From fhevmjs Direct Usage

**Before** (fhevmjs):
```typescript
import { createInstance } from 'fhevmjs';

const instance = await createInstance({
  network: window.ethereum,
  aclContractAddress: '0x...',
  kmsVerifierContractAddress: '0x...',
  inputVerifierContractAddress: '0x...',
});

const input = instance.createEncryptedInput('0xContract', '0xUser');
input.add32(42);
const encrypted = await input.encrypt();
```

**After** (@fhevm/core):
```typescript
import { FhevmClient } from '@fhevm/core';

const client = new FhevmClient();
await client.init({ provider: window.ethereum });
// ACL addresses auto-detected from Relayer SDK config

const encrypted = await client.encrypt({
  value: 42,
  type: 'euint32',
  contractAddress: '0xContract',
  userAddress: '0xUser',
});
```

**Key Changes**:
- ✅ Wrapped in class API with lifecycle management (`init()`, `getStatus()`)
- ✅ Automatic ACL address detection from network config
- ✅ Built-in storage adapters for public key/signature caching
- ✅ Type-safe encrypt/decrypt with `EncryptedType` enum
- ✅ Error handling with custom error classes (`FhevmError`, `FhevmAbortError`)

## Examples

See full working examples in our monorepo:

- **[Next.js App](../../examples/nextjs-app/)** - Complete dApp with RainbowKit + wagmi integration
- **[Vue App](../../examples/vue-app/)** - Vue 3 Composition API example
- **[Smart Contracts](../../packages/contracts/)** - Solidity contracts with encryption

**Live Demos**:
- [Next.js Demo](https://fhevm-sdk-nextjs.vercel.app) - Encrypted counter example
- [Vue Demo](https://fhevm-sdk-vue.netlify.app) - Same example in Vue 3

## License

BSD-3-Clause-Clear

## Links

- [FHEVM Documentation](https://docs.zama.ai/fhevm)
- [GitHub Repository](https://github.com/zama-ai/fhevm-sdk)
- [Zama](https://zama.ai)
