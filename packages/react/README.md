# @0xbojack/fhevm-react

React hooks and components for FHEVM SDK - Build privacy-preserving dApps with Fully Homomorphic Encryption.

## Features

- 🎣 **React Hooks**: Intuitive wagmi-like hooks (useInit, useEncrypt, useDecrypt)
- ⚛️ **Context Provider**: Simple setup with FhevmProvider
- 🔄 **Auto-cancellation**: Automatic cleanup on component unmount
- 📊 **Status Tracking**: Built-in loading and error states
- 🎯 **TypeScript**: Full type safety and IntelliSense support
- ⚡ **Framework-Agnostic Core**: Built on @0xbojack/fhevm-core

## Installation

```bash
npm install @0xbojack/fhevm-react @0xbojack/fhevm-core ethers
# or
pnpm add @0xbojack/fhevm-react @0xbojack/fhevm-core ethers
# or
yarn add @0xbojack/fhevm-react @0xbojack/fhevm-core ethers
```

## Quick Start

### 1. Setup Provider

Wrap your app with `FhevmProvider`:

```tsx
import { FhevmProvider, IndexedDBStorage } from '@0xbojack/fhevm-react';

function App() {
  return (
    <FhevmProvider config={{ storage: new IndexedDBStorage() }}>
      <YourApp />
    </FhevmProvider>
  );
}
```

### 2. Initialize FHEVM

```tsx
import { useInit } from '@0xbojack/fhevm-react';
import { BrowserProvider } from 'ethers';
import { useEffect } from 'react';

function InitializeButton() {
  const { init, status, error } = useInit();

  useEffect(() => {
    const initFhevm = async () => {
      const provider = new BrowserProvider(window.ethereum);
      await init({ provider });
    };
    initFhevm();
  }, []);

  if (status === 'loading') return <div>Initializing FHEVM...</div>;
  if (error) return <div>Error: {error.message}</div>;
  if (status === 'ready') return <div>FHEVM Ready ✅</div>;

  return <button onClick={() => init({ provider })}>Initialize</button>;
}
```

### 3. Encrypt Data

```tsx
import { useEncrypt, useStatus } from '@0xbojack/fhevm-react';

function EncryptComponent() {
  const { encrypt, data, isLoading, error } = useEncrypt();
  const { isReady } = useStatus();

  const handleEncrypt = async () => {
    const result = await encrypt({
      value: 42,
      type: 'euint32',
      contractAddress: '0x...',
      userAddress: '0x...',
    });

    if (result) {
      // Use result.handles and result.inputProof in your contract call
      console.log('Encrypted:', result);
    }
  };

  if (!isReady) return <div>Please initialize FHEVM first</div>;

  return (
    <div>
      <button onClick={handleEncrypt} disabled={isLoading}>
        {isLoading ? 'Encrypting...' : 'Encrypt Value'}
      </button>
      {error && <div>Error: {error.message}</div>}
      {data && <pre>{JSON.stringify(data, null, 2)}</pre>}
    </div>
  );
}
```

### 4. Decrypt Data

```tsx
import { useDecrypt } from '@0xbojack/fhevm-react';
import { BrowserProvider } from 'ethers';

function DecryptComponent() {
  const { decrypt, data, isLoading, error } = useDecrypt();

  const handleDecrypt = async () => {
    const provider = new BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();

    const result = await decrypt(
      [
        { handle: '0x...', contractAddress: '0x...' },
      ],
      signer
    );

    if (result) {
      console.log('Decrypted values:', result);
    }
  };

  return (
    <div>
      <button onClick={handleDecrypt} disabled={isLoading}>
        {isLoading ? 'Decrypting...' : 'Decrypt'}
      </button>
      {data && <div>Result: {JSON.stringify(data)}</div>}
      {error && <div>Error: {error.message}</div>}
    </div>
  );
}
```

## API Reference

### Components

#### `<FhevmProvider>`

Context provider for FHEVM client.

**Props:**
- `children: ReactNode` - Child components
- `config?: FhevmConfig` - Optional FHEVM configuration

**Example:**
```tsx
<FhevmProvider config={{ storage: new IndexedDBStorage() }}>
  <App />
</FhevmProvider>
```

### Hooks

#### `useInit()`

Initialize the FHEVM instance.

**Returns:**
- `init: (params: InitParams) => Promise<FhevmInstance | null>` - Initialize function
- `status: FhevmStatus` - Current status ('idle' | 'loading' | 'ready' | 'error')
- `instance: FhevmInstance | null` - FHEVM instance (null if not ready)
- `error: Error | null` - Error if initialization failed
- `cancel: () => void` - Cancel ongoing initialization

**Example:**
```tsx
const { init, status, instance, error, cancel } = useInit();

// Initialize with provider
await init({ provider });

// Or with RPC URL
await init({ provider: 'http://localhost:8545', chainId: 31337 });

// Cancel if needed
cancel();
```

#### `useEncrypt()`

Encrypt data for on-chain computation.

**Returns:**
- `encrypt: (params: EncryptParams) => Promise<EncryptResult | null>` - Encrypt function
- `data: EncryptResult | null` - Encrypted result
- `isLoading: boolean` - Loading state
- `error: Error | null` - Error if encryption failed
- `reset: () => void` - Reset state

**Supported Types:**
- `ebool` - Encrypted boolean
- `euint8`, `euint16`, `euint32`, `euint64`, `euint128`, `euint256` - Encrypted unsigned integers
- `eaddress` - Encrypted address

**Example:**
```tsx
const { encrypt, data, isLoading, error, reset } = useEncrypt();

const result = await encrypt({
  value: 100,
  type: 'euint32',
  contractAddress: '0x...',
  userAddress: '0x...',
});

// Reset state
reset();
```

#### `useDecrypt()`

Decrypt encrypted data (requires user signature).

**Returns:**
- `decrypt: (requests: DecryptRequest[], signer: JsonRpcSigner) => Promise<DecryptResult | null>` - Decrypt function
- `data: DecryptResult | null` - Decrypted result
- `isLoading: boolean` - Loading state
- `error: Error | null` - Error if decryption failed
- `reset: () => void` - Reset state

**Example:**
```tsx
const { decrypt, data, isLoading, error } = useDecrypt();

const provider = new BrowserProvider(window.ethereum);
const signer = await provider.getSigner();

const result = await decrypt(
  [
    { handle: '0x...', contractAddress: '0x...' },
    { handle: '0x...', contractAddress: '0x...' },
  ],
  signer
);
```

#### `useStatus()`

Get current status with convenience booleans.

**Returns:**
- `status: FhevmStatus` - Current status
- `isIdle: boolean` - Whether status is 'idle'
- `isLoading: boolean` - Whether status is 'loading'
- `isReady: boolean` - Whether status is 'ready'
- `isError: boolean` - Whether status is 'error'

**Example:**
```tsx
const { status, isReady, isLoading, isError } = useStatus();

if (isLoading) return <Spinner />;
if (isError) return <Error />;
if (isReady) return <App />;
```

#### `usePublicKey()`

Get the public key for encryption (only available after initialization).

**Returns:**
- `publicKey: string | null` - Public key (null if not ready)
- `error: Error | null` - Error if getting public key failed

**Example:**
```tsx
const { publicKey, error } = usePublicKey();

if (publicKey) {
  console.log('Public key:', publicKey);
}
```

#### `useFhevmContext()`

Access the FHEVM client and status from context.

**Returns:**
- `client: FhevmClient` - FHEVM client instance
- `status: FhevmStatus` - Current status

**Example:**
```tsx
const { client, status } = useFhevmContext();

// Direct access to client methods
const instance = client.getInstance();
```

## Complete Example

```tsx
import {
  FhevmProvider,
  useInit,
  useEncrypt,
  useDecrypt,
  useStatus,
  IndexedDBStorage,
} from '@0xbojack/fhevm-react';
import { BrowserProvider } from 'ethers';
import { useEffect } from 'react';

function App() {
  return (
    <FhevmProvider config={{ storage: new IndexedDBStorage() }}>
      <FhevmApp />
    </FhevmProvider>
  );
}

function FhevmApp() {
  const { init } = useInit();
  const { isReady, isLoading, isError } = useStatus();

  useEffect(() => {
    const initFhevm = async () => {
      const provider = new BrowserProvider(window.ethereum);
      await init({ provider });
    };
    initFhevm();
  }, []);

  if (isLoading) return <div>Loading FHEVM...</div>;
  if (isError) return <div>Failed to initialize FHEVM</div>;
  if (!isReady) return <div>Please connect wallet</div>;

  return (
    <div>
      <h1>FHEVM Demo</h1>
      <EncryptSection />
      <DecryptSection />
    </div>
  );
}

function EncryptSection() {
  const { encrypt, data, isLoading } = useEncrypt();

  return (
    <div>
      <button
        onClick={() =>
          encrypt({
            value: 42,
            type: 'euint32',
            contractAddress: '0x...',
            userAddress: '0x...',
          })
        }
        disabled={isLoading}
      >
        Encrypt
      </button>
      {data && <pre>{JSON.stringify(data, null, 2)}</pre>}
    </div>
  );
}

function DecryptSection() {
  const { decrypt, data, isLoading } = useDecrypt();

  const handleDecrypt = async () => {
    const provider = new BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();

    await decrypt(
      [{ handle: '0x...', contractAddress: '0x...' }],
      signer
    );
  };

  return (
    <div>
      <button onClick={handleDecrypt} disabled={isLoading}>
        Decrypt
      </button>
      {data && <pre>{JSON.stringify(data, null, 2)}</pre>}
    </div>
  );
}
```

## TypeScript Support

Full TypeScript support with comprehensive type definitions.

```tsx
import type {
  FhevmConfig,
  FhevmStatus,
  InitParams,
  EncryptParams,
  EncryptResult,
  DecryptRequest,
  DecryptResult,
} from '@0xbojack/fhevm-react';
```

## License

BSD-3-Clause-Clear

## Links

- [FHEVM Documentation](https://docs.zama.ai/fhevm)
- [@0xbojack/fhevm-core](../core)
- [GitHub Repository](https://github.com/zama-ai/fhevm-sdk)
- [Zama](https://zama.ai)
