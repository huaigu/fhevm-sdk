# FHEVM SDK - Vue 3 Example

A complete Vue 3 demo showcasing the **@fhevm/vue** SDK for building privacy-preserving dApps with Fully Homomorphic Encryption (FHE).

## 🌟 Features

- **Vue 3 Composition API** with `<script setup>` and TypeScript
- **All FHEVM Composables** demonstrated: `useInit`, `useStatus`, `useEncrypt`, `useDecrypt`, `usePublicKey`
- **Network Detection** - Supports Sepolia Testnet and Local Hardhat
- **Auto-Initialization** - Seamless FHEVM setup on wallet connection
- **Encrypted Counter Demo** - Complete encrypt → transact → decrypt flow
- **Clean UI** - Comprehensive error handling and loading states

## 📦 Tech Stack

- [Vue 3](https://vuejs.org/) - Progressive JavaScript Framework
- [Vite](https://vitejs.dev/) - Next Generation Frontend Tooling
- [TypeScript](https://www.typescriptlang.org/) - Type Safety
- [@fhevm/vue](../../packages/vue/) - Vue 3 SDK for FHEVM
- [@fhevm/core](../../packages/core/) - Framework-agnostic FHEVM client
- [Ethers.js v6](https://docs.ethers.org/v6/) - Ethereum Library

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- pnpm 8+
- MetaMask or compatible Web3 wallet

### Installation

From the monorepo root:

```bash
# Install dependencies
pnpm install

# Run Vue example
pnpm example:vue

# Build for production
pnpm example:vue:build
```

Or from this directory:

```bash
pnpm install
pnpm dev
```

Visit http://localhost:5173

### Environment Setup

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Configure your network (optional):
   ```env
   VITE_DEFAULT_CHAIN_ID=11155111
   ```

## 🔧 Project Structure

```
vue-app/
├── public/
│   └── vite.svg              # Vite icon
├── src/
│   ├── components/
│   │   ├── Header.vue        # Wallet connection header
│   │   └── EncryptedCounter.vue  # Main demo component
│   ├── composables/
│   │   └── useWallet.ts      # Wallet state management
│   ├── contracts/
│   │   └── deployedContracts.ts  # Contract addresses & ABIs
│   ├── App.vue               # Root component
│   ├── main.ts               # App entry point
│   └── style.css             # Global styles
├── index.html                # HTML entry
├── vite.config.ts            # Vite configuration
├── tsconfig.json             # TypeScript config
└── package.json              # Dependencies
```

## 🎯 FHEVM Composables Usage

### 1. Plugin Setup (main.ts)

```typescript
import { createApp } from 'vue'
import { createFhevm } from '@fhevm/vue'
import { IndexedDBStorage } from '@fhevm/core'

const app = createApp(App)

const fhevm = createFhevm({
  config: {
    storage: new IndexedDBStorage(),
  },
})

app.use(fhevm)
```

### 2. Initialize SDK

```typescript
import { useInit, useStatus } from '@fhevm/vue'

const { init } = useInit()
const { isReady, isLoading } = useStatus()

// Initialize when wallet connects
await init({ provider: window.ethereum })
```

### 3. Encrypt Data

```typescript
import { useEncrypt } from '@fhevm/vue'

const { encrypt, data, isLoading } = useEncrypt()

const encrypted = await encrypt({
  value: 42,
  type: 'uint32',
  userAddress: account.value,
})

// Use encrypted.data and encrypted.proof in transactions
```

### 4. Decrypt Contract Data

```typescript
import { useDecrypt } from '@fhevm/vue'

const { decrypt, data, isLoading } = useDecrypt()

await decrypt({
  contractAddress: '0x...',
  ciphertext: encryptedValue,
})

// Decrypted value available in data
console.log(data.value) // 42
```

## 🔐 Smart Contract Integration

The example uses the `FHECounter` contract deployed on Sepolia:

```solidity
// Simplified contract interface
contract FHECounter {
  euint32 private count;

  function getCount() public view returns (euint32) {
    return count;
  }

  function increment(einput encryptedValue, bytes calldata inputProof) public {
    euint32 value = TFHE.asEuint32(encryptedValue, inputProof);
    count = TFHE.add(count, value);
  }

  function decrement(einput encryptedValue, bytes calldata inputProof) public {
    euint32 value = TFHE.asEuint32(encryptedValue, inputProof);
    count = TFHE.sub(count, value);
  }
}
```

**Sepolia Deployment**: `0x269ea49ac93ae5dd7a98ee0a681a2c0396fbaf8f`

## 🌐 Supported Networks

| Network | Chain ID | Status |
|---------|----------|--------|
| Sepolia Testnet | 11155111 | ✅ Deployed |
| Local Hardhat | 31337 | 🔧 Development |

### Adding New Networks

Edit `src/contracts/deployedContracts.ts`:

```typescript
export const deployedContracts = {
  // Add your network
  [chainId]: {
    FHECounter: {
      address: "0x..." as `0x${string}`,
      abi: [...] as const,
    },
  },
} as const;
```

## 🛠️ Development

### Available Scripts

```bash
pnpm dev          # Start dev server
pnpm build        # Build for production
pnpm preview      # Preview production build
pnpm type-check   # Run TypeScript checks
```

### Component Architecture

**Header.vue**: Wallet connection state
- Network detection
- Connect/Disconnect buttons
- Account display

**EncryptedCounter.vue**: Main demo
- Auto-initialization on wallet connect
- Encrypt → Send → Decrypt workflow
- All 5 FHEVM composables in action
- Comprehensive error handling

**useWallet.ts**: Wallet state composable
- Reactive account and chainId
- Event listeners for changes
- Auto-connect on mount

## 📚 Learn More

- **FHEVM SDK Docs**: [../../README.md](../../README.md)
- **Vue Package**: [../../packages/vue/](../../packages/vue/)
- **Core Package**: [../../packages/core/](../../packages/core/)
- **Zama FHEVM**: [https://github.com/zama-ai/fhevm](https://github.com/zama-ai/fhevm)
- **Vue 3 Docs**: [https://vuejs.org](https://vuejs.org)

## 🤝 Contributing

Found a bug or have a suggestion? Open an issue or PR in the main repository.

## 📄 License

MIT
