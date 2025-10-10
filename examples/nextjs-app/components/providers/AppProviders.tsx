"use client";

import { FhevmProvider, IndexedDBStorage, MemoryStorage } from "@fhevm/react";
import { RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { WagmiProvider } from "wagmi";
import { wagmiConfig } from "~/lib/wagmiConfig";
import { Header } from "~/components/Header";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
});

/**
 * Root providers for the FHEVM SDK example app
 *
 * Provider stack from inside to outside:
 * 1. WagmiProvider - Wallet connection and blockchain interactions
 * 2. QueryClientProvider - React Query for data fetching
 * 3. RainbowKitProvider - Wallet UI components
 * 4. FhevmProvider - FHEVM SDK with IndexedDB storage for persistence
 */
export function AppProviders({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          <FhevmProvider
            config={{
              // Use IndexedDB only in browser, fallback to Memory for SSR
              storage: mounted && typeof window !== 'undefined'
                ? new IndexedDBStorage()
                : new MemoryStorage(),
            }}
          >
            <div className="flex flex-col min-h-screen">
              <Header />
              {children}
            </div>
          </FhevmProvider>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
