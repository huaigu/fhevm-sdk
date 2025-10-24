# FHEVM SDK - Next.js Example

A minimal Next.js application demonstrating how to use the `@0xbojack/fhevm-nextjs` SDK for Fully Homomorphic Encryption on Ethereum.

## 🎯 What This Example Shows

This example demonstrates the complete FHEVM workflow using wagmi-like React hooks:

- **Initialization**: Auto-initialize FHEVM when wallet connects
- **Encryption**: Encrypt data client-side before sending to blockchain
- **Decryption**: Decrypt on-chain encrypted data with user signatures
- **Network Detection**: Automatically detect and configure for Sepolia or local networks
- **Type Safety**: Full TypeScript support with encrypted types (euint32, etc.)

## 🚀 Quick Start

### Prerequisites

- Node.js >= 20.0.0
- pnpm (recommended) or npm

### Installation

From the repository root:

```bash
# Install dependencies
pnpm install

# Run the example
pnpm --filter nextjs-example dev
```

Or from this directory:

```bash
pnpm install
pnpm dev
```

The app will start at [http://localhost:3000](http://localhost:3000)

### Environment Setup

1. Copy the example environment file:
   ```bash
   cp .env.example .env.local
   ```

2. (Optional) Add your Alchemy API key for better performance:
   ```env
   NEXT_PUBLIC_ALCHEMY_API_KEY=your_alchemy_api_key_here
   ```

   - **Without API key**: Uses PublicNode Sepolia RPC (`https://ethereum-sepolia-rpc.publicnode.com`)
   - **With API key**: Uses Alchemy RPC for faster, more reliable requests
   
   Get your API key from [Alchemy Dashboard](https://dashboard.alchemy.com/)

3. (Optional) Add WalletConnect Project ID for enhanced wallet support:
   ```env
   NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=your_project_id
   ```

   Get your ID from [WalletConnect Cloud](https://cloud.walletconnect.com/)

## 📦 What's Included

### Dependencies

- `@0xbojack/fhevm-core` - Framework-agnostic FHEVM SDK core
- `@0xbojack/fhevm-nextjs` - React hooks for FHEVM (useInit, useEncrypt, useDecrypt, useStatus)
- `wagmi` - Ethereum React hooks
- `@rainbow-me/rainbowkit` - Wallet connection UI
- `next` - Next.js 15 framework
- `shadcn/ui` - Modern UI component library with Tailwind CSS

### Project Structure

```
examples/nextjs-app/
├── app/
│   ├── layout.tsx              # Root layout with providers
│   ├── page.tsx                # Home page with demo
│   └── globals.css             # Global styles
├── components/
│   ├── providers/
│   │   └── AppProviders.tsx    # Provider composition
│   ├── EncryptedCounter.tsx    # Main demo component
│   └── Header.tsx              # Header with wallet connect
├── contracts/
│   └── deployedContracts.ts    # Contract addresses and ABIs
├── lib/
│   └── wagmiConfig.ts          # Wagmi configuration
├── package.json
├── next.config.ts
├── tsconfig.json
└── README.md
```

## 🔐 FHEVM Hooks Usage

### 1. Initialize FHEVM

```tsx
import { useInit, useStatus } from "@0xbojack/fhevm-nextjs";

function App() {
  const { init, status, error } = useInit();
  const { isReady, isLoading } = useStatus();

  useEffect(() => {
    if (walletClient && !isReady && !isLoading) {
      init({ provider: window.ethereum });
    }
  }, [walletClient, isReady, isLoading, init]);

  return <div>Status: {status}</div>;
}
```

### 2. Encrypt Data

```tsx
import { useEncrypt } from "@0xbojack/fhevm-nextjs";

function EncryptDemo() {
  const { encrypt, data, isLoading, error } = useEncrypt();

  const handleEncrypt = async () => {
    await encrypt({
      value: 42,
      type: "euint32",
      contractAddress: "0x...",
      userAddress: "0x...",
    });
  };

  return (
    <button onClick={handleEncrypt} disabled={isLoading}>
      {isLoading ? "Encrypting..." : "Encrypt"}
    </button>
  );
}
```

### 3. Decrypt Data

```tsx
import { useDecrypt } from "@0xbojack/fhevm-nextjs";

function DecryptDemo() {
  const { decrypt, data, isLoading, error } = useDecrypt();

  const handleDecrypt = async (signer) => {
    await decrypt(
      [{
        handle: "0x...",
        contractAddress: "0x...",
      }],
      signer
    );
  };

  return <div>Decrypted: {JSON.stringify(data)}</div>;
}
```

## 🌐 Deployed Contract

This example connects to a pre-deployed FHECounter contract on Sepolia:

- **Address**: `0x269ea49ac93ae5dd7a98ee0a681a2c0396fbaf8f`
- **Network**: Sepolia Testnet (Chain ID: 11155111)

The contract has three methods:
- `getCount()` - Returns encrypted counter value
- `increment(einput encryptedValue, bytes inputProof)` - Increment counter
- `decrement(einput encryptedValue, bytes inputProof)` - Decrement counter

## 🔧 Development

### Build for Production

```bash
pnpm build
```

### Lint Code

```bash
pnpm lint
```

### Type Check

```bash
pnpm check-types
```

## 🚀 Deployment

### Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/fhevm-sdk)

1. Push your code to GitHub
2. Import the project to Vercel
3. Configure environment variables:
   - `NEXT_PUBLIC_ALCHEMY_API_KEY`
   - `NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID`
4. Deploy!

The build will automatically use the correct workspace dependencies.

## 📚 Learn More

- [FHEVM Documentation](https://docs.zama.ai/fhevm)
- [Zama](https://www.zama.ai/)
- [@0xbojack/fhevm-nextjs Package](../../packages/react/README.md)
- [@0xbojack/fhevm-core Package](../../packages/core/README.md)

## 🤝 Contributing

This example is part of the FHEVM SDK monorepo. Contributions are welcome!

## 📄 License

BSD-3-Clause-Clear
