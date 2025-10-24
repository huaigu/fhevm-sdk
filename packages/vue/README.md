# @0xbojack/fhevm-vue

Vue 3 composables for FHEVM SDK - Build privacy-preserving dApps with Fully Homomorphic Encryption.

## Features

- 🎯 **Vue 3 Composables**: Intuitive composition API (useInit, useEncrypt, useDecrypt)
- 🔌 **Plugin System**: Simple setup with Vue plugin
- 🔄 **Auto-cleanup**: Automatic resource cleanup on unmount
- 📊 **Reactive State**: Built-in reactive loading and error states
- 🎯 **TypeScript**: Full type safety and IntelliSense support
- ⚡ **Framework-Agnostic Core**: Built on @0xbojack/fhevm-core

## Installation

```bash
npm install @0xbojack/fhevm-vue @0xbojack/fhevm-core ethers
# or
pnpm add @0xbojack/fhevm-vue @0xbojack/fhevm-core ethers
# or
yarn add @0xbojack/fhevm-vue @0xbojack/fhevm-core ethers
```

## Quick Start

### 1. Setup Plugin

Install the FHEVM plugin in your Vue app:

```ts
// main.ts
import { createApp } from 'vue';
import { createFhevm, IndexedDBStorage } from '@0xbojack/fhevm-vue';
import App from './App.vue';

const app = createApp(App);

const fhevm = createFhevm({
  config: { storage: new IndexedDBStorage() }
});

app.use(fhevm);
app.mount('#app');
```

### 2. Initialize FHEVM

```vue
<script setup lang="ts">
import { useInit } from '@0xbojack/fhevm-vue';
import { BrowserProvider } from 'ethers';
import { onMounted } from 'vue';

const { init, status, error, isReady } = useInit();

onMounted(async () => {
  const provider = new BrowserProvider(window.ethereum);
  await init({ provider });
});
</script>

<template>
  <div v-if="status === 'loading'">Initializing FHEVM...</div>
  <div v-else-if="error">Error: {{ error.message }}</div>
  <div v-else-if="isReady">FHEVM Ready ✅</div>
  <button v-else @click="init({ provider })">Initialize</button>
</template>
```

### 3. Encrypt Data

```vue
<script setup lang="ts">
import { useEncrypt, useStatus } from '@0xbojack/fhevm-vue';

const { encrypt, data, isLoading, error } = useEncrypt();
const { isReady } = useStatus();

const handleEncrypt = async () => {
  await encrypt({
    value: 42,
    type: 'euint32',
    contractAddress: '0x...',
    userAddress: '0x...',
  });
};
</script>

<template>
  <div v-if="!isReady">Please initialize FHEVM first</div>
  <div v-else>
    <button @click="handleEncrypt" :disabled="isLoading">
      {{ isLoading ? 'Encrypting...' : 'Encrypt Value' }}
    </button>
    <div v-if="error">Error: {{ error.message }}</div>
    <pre v-if="data">{{ JSON.stringify(data, null, 2) }}</pre>
  </div>
</template>
```

### 4. Decrypt Data

```vue
<script setup lang="ts">
import { useDecrypt } from '@0xbojack/fhevm-vue';
import { BrowserProvider } from 'ethers';

const { decrypt, data, isLoading, error } = useDecrypt();

const handleDecrypt = async () => {
  const provider = new BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();

  await decrypt(
    [{ handle: '0x...', contractAddress: '0x...' }],
    signer
  );
};
</script>

<template>
  <button @click="handleDecrypt" :disabled="isLoading">
    {{ isLoading ? 'Decrypting...' : 'Decrypt' }}
  </button>
  <div v-if="data">Result: {{ JSON.stringify(data) }}</div>
  <div v-if="error">Error: {{ error.message }}</div>
</template>
```

## API Reference

### Plugin

#### `createFhevm(options?)`

Create the FHEVM Vue plugin.

**Parameters:**
- `options.config?: FhevmConfig` - Optional FHEVM configuration

**Returns:** Vue plugin object

**Example:**
```ts
import { createFhevm, IndexedDBStorage } from '@0xbojack/fhevm-vue';

const fhevm = createFhevm({
  config: { storage: new IndexedDBStorage() }
});

app.use(fhevm);
```

### Composables

#### `useInit()`

Initialize the FHEVM instance.

**Returns:**
- `init: (params: InitParams) => Promise<FhevmInstance | null>` - Initialize function
- `status: Ref<FhevmStatus>` - Current status
- `instance: Ref<FhevmInstance | null>` - FHEVM instance
- `error: Ref<Error | null>` - Error if initialization failed
- `cancel: () => void` - Cancel ongoing initialization
- `isIdle: Ref<boolean>` - Whether status is 'idle'
- `isLoading: Ref<boolean>` - Whether status is 'loading'
- `isReady: Ref<boolean>` - Whether status is 'ready'
- `isError: Ref<boolean>` - Whether status is 'error'

**Example:**
```vue
<script setup>
const { init, status, isReady, cancel } = useInit();

// Initialize
await init({ provider });

// Or with RPC URL
await init({ provider: 'http://localhost:8545', chainId: 31337 });

// Cancel if needed
cancel();
</script>
```

#### `useEncrypt()`

Encrypt data for on-chain computation.

**Returns:**
- `encrypt: (params: EncryptParams) => Promise<EncryptResult | null>` - Encrypt function
- `data: Ref<EncryptResult | null>` - Encrypted result
- `isLoading: Ref<boolean>` - Loading state
- `error: Ref<Error | null>` - Error if encryption failed
- `reset: () => void` - Reset state

**Supported Types:**
- `ebool` - Encrypted boolean
- `euint8`, `euint16`, `euint32`, `euint64`, `euint128`, `euint256` - Encrypted unsigned integers
- `eaddress` - Encrypted address

**Example:**
```vue
<script setup>
const { encrypt, data, isLoading, reset } = useEncrypt();

await encrypt({
  value: 100,
  type: 'euint32',
  contractAddress: '0x...',
  userAddress: '0x...',
});

// Reset state
reset();
</script>
```

#### `useDecrypt()`

Decrypt encrypted data (requires user signature).

**Returns:**
- `decrypt: (requests: DecryptRequest[], signer: JsonRpcSigner) => Promise<DecryptResult | null>` - Decrypt function
- `data: Ref<DecryptResult | null>` - Decrypted result
- `isLoading: Ref<boolean>` - Loading state
- `error: Ref<Error | null>` - Error if decryption failed
- `reset: () => void` - Reset state

**Example:**
```vue
<script setup>
const { decrypt, data, isLoading } = useDecrypt();

const provider = new BrowserProvider(window.ethereum);
const signer = await provider.getSigner();

await decrypt(
  [
    { handle: '0x...', contractAddress: '0x...' },
    { handle: '0x...', contractAddress: '0x...' },
  ],
  signer
);
</script>
```

#### `useStatus()`

Get current status with reactive computed properties.

**Returns:**
- `status: Ref<FhevmStatus>` - Current status
- `isIdle: Ref<boolean>` - Whether status is 'idle'
- `isLoading: Ref<boolean>` - Whether status is 'loading'
- `isReady: Ref<boolean>` - Whether status is 'ready'
- `isError: Ref<boolean>` - Whether status is 'error'

**Example:**
```vue
<script setup>
const { status, isReady, isLoading, isError } = useStatus();
</script>

<template>
  <Spinner v-if="isLoading" />
  <Error v-else-if="isError" />
  <App v-else-if="isReady" />
</template>
```

#### `usePublicKey()`

Get the public key for encryption (only available after initialization).

**Returns:**
- `publicKey: Ref<string | null>` - Public key (null if not ready)
- `error: Ref<Error | null>` - Error if getting public key failed

**Example:**
```vue
<script setup>
const { publicKey, error } = usePublicKey();
</script>

<template>
  <div v-if="publicKey">Public key: {{ publicKey }}</div>
</template>
```

#### `useFhevmClient()`

Access the FHEVM client directly.

**Returns:** `FhevmClient` - FHEVM client instance

**Example:**
```vue
<script setup>
import { useFhevmClient } from '@0xbojack/fhevm-vue';

const client = useFhevmClient();

// Direct access to client methods
const instance = client.getInstance();
</script>
```

## Complete Example

```vue
<!-- App.vue -->
<script setup lang="ts">
import { useInit, useEncrypt, useDecrypt, useStatus } from '@0xbojack/fhevm-vue';
import { BrowserProvider } from 'ethers';
import { onMounted } from 'vue';

const { init } = useInit();
const { isReady, isLoading, isError } = useStatus();
const { encrypt, data: encryptedData, isLoading: isEncrypting } = useEncrypt();
const { decrypt, data: decryptedData, isLoading: isDecrypting } = useDecrypt();

onMounted(async () => {
  const provider = new BrowserProvider(window.ethereum);
  await init({ provider });
});

const handleEncrypt = async () => {
  await encrypt({
    value: 42,
    type: 'euint32',
    contractAddress: '0x...',
    userAddress: '0x...',
  });
};

const handleDecrypt = async () => {
  const provider = new BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();

  await decrypt(
    [{ handle: '0x...', contractAddress: '0x...' }],
    signer
  );
};
</script>

<template>
  <div class="app">
    <h1>FHEVM Demo</h1>

    <div v-if="isLoading">Loading FHEVM...</div>
    <div v-else-if="isError">Failed to initialize FHEVM</div>
    <div v-else-if="!isReady">Please connect wallet</div>

    <div v-else>
      <!-- Encrypt Section -->
      <section>
        <h2>Encrypt</h2>
        <button @click="handleEncrypt" :disabled="isEncrypting">
          {{ isEncrypting ? 'Encrypting...' : 'Encrypt Value' }}
        </button>
        <pre v-if="encryptedData">{{ encryptedData }}</pre>
      </section>

      <!-- Decrypt Section -->
      <section>
        <h2>Decrypt</h2>
        <button @click="handleDecrypt" :disabled="isDecrypting">
          {{ isDecrypting ? 'Decrypting...' : 'Decrypt Value' }}
        </button>
        <pre v-if="decryptedData">{{ decryptedData }}</pre>
      </section>
    </div>
  </div>
</template>
```

```ts
// main.ts
import { createApp } from 'vue';
import { createFhevm, IndexedDBStorage } from '@0xbojack/fhevm-vue';
import App from './App.vue';

const app = createApp(App);

const fhevm = createFhevm({
  config: { storage: new IndexedDBStorage() }
});

app.use(fhevm);
app.mount('#app');
```

## TypeScript Support

Full TypeScript support with comprehensive type definitions.

```ts
import type {
  FhevmConfig,
  FhevmStatus,
  InitParams,
  EncryptParams,
  EncryptResult,
  DecryptRequest,
  DecryptResult,
} from '@0xbojack/fhevm-vue';
```

## Composition API Only

This package supports **Vue 3 Composition API only**. Options API is not supported.

## License

BSD-3-Clause-Clear

## Links

- [FHEVM Documentation](https://docs.zama.ai/fhevm)
- [@0xbojack/fhevm-core](../core)
- [@0xbojack/fhevm-react](../react)
- [GitHub Repository](https://github.com/zama-ai/fhevm-sdk)
- [Zama](https://zama.ai)
