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

## License

BSD-3-Clause-Clear

## Links

- [FHEVM Documentation](https://docs.zama.ai/fhevm)
- [GitHub Repository](https://github.com/zama-ai/fhevm-sdk)
- [Zama](https://zama.ai)
