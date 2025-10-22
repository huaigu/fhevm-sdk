# @0xbojack/fhevm-nextjs

Next.js adapter for FHEVM SDK with built-in `'use client'` directives. This package provides the same React hooks as `@0xbojack/fhevm-react`, but automatically handles client-side rendering for Next.js applications.

## Why Use This Package?

In Next.js, FHEVM operations require client-side execution. With `@0xbojack/fhevm-react`, you need to manually add `'use client'` to every component:

```tsx
// ❌ With @0xbojack/fhevm-react - requires manual 'use client'
'use client'

import { useFhevm } from '@0xbojack/fhevm-react'

export default function MyComponent() {
  const { instance } = useFhevm()
  return <div>...</div>
}
```

With `@0xbojack/fhevm-nextjs`, the `'use client'` directive is already included:

```tsx
// ✅ With @0xbojack/fhevm-nextjs - no manual directive needed!
import { useFhevm } from '@0xbojack/fhevm-nextjs'

export default function MyComponent() {
  const { instance } = useFhevm()
  return <div>...</div>
}
```

## Installation

```bash
npm install @0xbojack/fhevm-nextjs ethers
# or
pnpm add @0xbojack/fhevm-nextjs ethers
# or
yarn add @0xbojack/fhevm-nextjs ethers
```

## Quick Start

### 1. Create FHEVM Provider (App Router)

```tsx
// app/providers.tsx
import { FhevmProvider } from '@0xbojack/fhevm-nextjs'
import { ReactNode } from 'react'

export function Providers({ children }: { children: ReactNode }) {
  return (
    <FhevmProvider config={{ storage: /* your storage */ }}>
      {children}
    </FhevmProvider>
  )
}
```

### 2. Add Provider to Layout

```tsx
// app/layout.tsx
import { Providers } from './providers'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
```

### 3. Use FHEVM Hooks in Components

```tsx
// app/page.tsx (or any component)
import { useFhevm, useEncrypt, useDecrypt } from '@0xbojack/fhevm-nextjs'
import { useEffect } from 'react'
import { BrowserProvider } from 'ethers'

export default function EncryptPage() {
  const { instance, status, init } = useFhevm()
  const { encrypt, isEncrypting } = useEncrypt()
  const { decrypt, isDecrypting, results } = useDecrypt()

  useEffect(() => {
    async function initFhevm() {
      if (typeof window !== 'undefined' && window.ethereum) {
        const provider = new BrowserProvider(window.ethereum)
        await init({ provider })
      }
    }
    initFhevm()
  }, [init])

  const handleEncrypt = async () => {
    if (!instance) return

    const encrypted = await encrypt({
      value: 42,
      type: 'euint32',
      contractAddress: '0x...',
      userAddress: '0x...',
    })

    console.log('Encrypted:', encrypted)
  }

  return (
    <div>
      <h1>FHEVM Encryption</h1>
      <p>Status: {status}</p>
      <button onClick={handleEncrypt} disabled={isEncrypting || status !== 'ready'}>
        {isEncrypting ? 'Encrypting...' : 'Encrypt Value'}
      </button>
    </div>
  )
}
```

## API Reference

This package re-exports all hooks and types from `@0xbojack/fhevm-react` and `@0xbojack/fhevm-core`:

### Hooks

- `useFhevm()` - Initialize and manage FHEVM instance
- `useEncrypt()` - Encrypt data for on-chain computation
- `useDecrypt()` - Decrypt encrypted data

### Components

- `FhevmProvider` - Context provider for FHEVM instance

### Types

All TypeScript types from core and react packages are available:

```tsx
import type {
  // Core types
  FhevmConfig,
  FhevmStatus,
  EncryptedType,
  EncryptParams,
  DecryptRequest,
  // React hook types
  UseFhevmResult,
  UseEncryptResult,
  UseDecryptResult,
} from '@0xbojack/fhevm-nextjs'
```

## Next.js App Router Example

### Complete Example with RainbowKit

```tsx
// app/providers.tsx
'use client'

import { FhevmProvider } from '@0xbojack/fhevm-nextjs'
import { IndexedDBStorage } from '@0xbojack/fhevm-core/storage'
import { WagmiProvider } from 'wagmi'
import { RainbowKitProvider } from '@rainbow-me/rainbowkit'
import { config } from './wagmi'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <RainbowKitProvider>
        <FhevmProvider config={{ storage: new IndexedDBStorage() }}>
          {children}
        </FhevmProvider>
      </RainbowKitProvider>
    </WagmiProvider>
  )
}
```

```tsx
// app/page.tsx
import { useFhevm, useEncrypt } from '@0xbojack/fhevm-nextjs'
import { useAccount, useWalletClient } from 'wagmi'
import { useEffect } from 'react'

export default function Home() {
  const { address } = useAccount()
  const { data: walletClient } = useWalletClient()
  const { instance, status, init } = useFhevm()
  const { encrypt } = useEncrypt()

  useEffect(() => {
    if (walletClient) {
      init({ provider: walletClient })
    }
  }, [walletClient, init])

  return (
    <div>
      <h1>FHEVM + Next.js</h1>
      <p>Status: {status}</p>
      <p>Connected: {address}</p>
    </div>
  )
}
```

## Next.js Pages Router Example

```tsx
// pages/_app.tsx
import type { AppProps } from 'next/app'
import { FhevmProvider } from '@0xbojack/fhevm-nextjs'
import { IndexedDBStorage } from '@0xbojack/fhevm-core/storage'

export default function App({ Component, pageProps }: AppProps) {
  return (
    <FhevmProvider config={{ storage: new IndexedDBStorage() }}>
      <Component {...pageProps} />
    </FhevmProvider>
  )
}
```

```tsx
// pages/index.tsx
import { useFhevm, useEncrypt } from '@0xbojack/fhevm-nextjs'
import { useEffect } from 'react'
import { BrowserProvider } from 'ethers'

export default function Home() {
  const { instance, status, init } = useFhevm()

  useEffect(() => {
    if (typeof window !== 'undefined' && window.ethereum) {
      const provider = new BrowserProvider(window.ethereum)
      init({ provider })
    }
  }, [init])

  return (
    <div>
      <h1>FHEVM Next.js</h1>
      <p>Status: {status}</p>
    </div>
  )
}
```

## Differences from @0xbojack/fhevm-react

| Feature | @0xbojack/fhevm-react | @0xbojack/fhevm-nextjs |
|---------|----------------------|------------------------|
| **Framework** | React (CRA, Vite) | Next.js (App/Pages Router) |
| **`'use client'` directive** | ❌ Manual required | ✅ Built-in |
| **SSR Support** | N/A | ✅ Handles client-side automatically |
| **API** | Identical | Identical |
| **Bundle Size** | Lighter (no Next.js deps) | Slightly larger |

## When to Use Each Package

- **Use `@0xbojack/fhevm-nextjs`**: Building a Next.js application
- **Use `@0xbojack/fhevm-react`**: Building with Create React App, Vite, or other React frameworks
- **Use `@0xbojack/fhevm-core`**: Framework-agnostic usage (Node.js, vanilla JS)

## Troubleshooting

### "window is not defined" Error

Make sure you're initializing FHEVM only on the client side:

```tsx
useEffect(() => {
  if (typeof window !== 'undefined') {
    // Initialize FHEVM here
  }
}, [])
```

### Hydration Errors

If you see hydration mismatches, ensure FHEVM operations happen after hydration:

```tsx
const [mounted, setMounted] = useState(false)

useEffect(() => {
  setMounted(true)
}, [])

if (!mounted) return null

return <YourComponent />
```

## Examples

See full working examples in our monorepo:

- **[Next.js App](../../examples/nextjs-app/)** - Complete App Router example with RainbowKit
- **[Vue App](../../examples/vue-app/)** - Vue 3 example for comparison

## Related Packages

- [`@0xbojack/fhevm-core`](../core) - Framework-agnostic core library
- [`@0xbojack/fhevm-react`](../react) - React hooks (requires manual `'use client'`)
- [`@0xbojack/fhevm-vue`](../vue) - Vue 3 composables

## License

BSD-3-Clause-Clear

## Links

- [FHEVM Documentation](https://docs.zama.ai/fhevm)
- [GitHub Repository](https://github.com/huaigu/fhevm-sdk)
- [Zama](https://zama.ai)
