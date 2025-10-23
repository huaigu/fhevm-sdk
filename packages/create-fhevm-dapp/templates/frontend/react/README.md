# FHEVM React Example

React + Vite example demonstrating the `@0xbojack/fhevm-react` SDK.

## Features

- ⚡ **Vite** - Lightning fast build tool
- ⚛️ **React 18** - Latest React with hooks
- 🔐 **FHEVM SDK** - Wagmi-like hooks for encrypted computation
- 💰 **RainbowKit** - Beautiful wallet connection UI
- 🎨 **Tailwind CSS** - Utility-first styling
- 📝 **TypeScript** - Full type safety

## Quick Start

From the generated monorepo root:

```bash
pnpm install            # install all workspace dependencies
pnpm chain              # terminal 1: start local Hardhat node
pnpm deploy:localhost   # terminal 2: deploy contracts & refresh ABIs
pnpm dev                # terminal 3: launch the React app

# Optional: regenerate ABI map without redeploying
pnpm generate:abis
```

Or from this package directory:

```bash
pnpm install
pnpm dev
```

## Project Structure

```
src/
├── components/
│   ├── providers/
│   │   └── AppProviders.tsx    # All React providers
│   ├── ui/                      # shadcn/ui components
│   ├── EncryptedCounter.tsx     # Main demo component
│   └── Header.tsx               # Header with wallet button
├── lib/
│   ├── wagmiConfig.ts           # Wagmi configuration
│   └── utils.ts                 # Utility functions
├── App.tsx                      # Main app component
├── main.tsx                     # React entry point
└── index.css                    # Global styles
```

> `contracts/deployedContracts.ts` is auto-generated after each `pnpm deploy:*`. Run `pnpm generate:abis` from the repository root if you need to refresh it manually.

## FHEVM Hooks Usage

```tsx
import { useInit, useEncrypt, useDecrypt, useStatus } from "@0xbojack/fhevm-react";

function MyComponent() {
  // Initialize FHEVM instance
  const { init } = useInit();

  // Check initialization status
  const { isReady, isLoading } = useStatus();

  // Encrypt data
  const { encrypt } = useEncrypt();

  // Decrypt data
  const { decrypt, data } = useDecrypt();

  // Your component logic...
}
```

## Learn More

- [FHEVM Documentation](https://docs.zama.ai/fhevm)
- [FHEVM SDK Repository](https://github.com/0xbojack/fhevm-sdk)
- [React Documentation](https://react.dev)
- [Vite Documentation](https://vitejs.dev)
