"use client";

import { FhevmProvider, IndexedDBStorage, MemoryStorage } from "@0xbojack/fhevm-nextjs";
import { RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, useEffect, useMemo } from "react";
import { ThemeProvider } from "next-themes";
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
 * Provider stack (outermost to innermost):
 * 1. ThemeProvider - next-themes for light/dark mode
 * 2. WagmiProvider - Wallet connection and blockchain interactions
 * 3. QueryClientProvider - React Query for data fetching
 * 4. RainbowKitProvider - Wallet UI components
 * 5. FhevmProvider - FHEVM SDK with IndexedDB storage for persistence
 */
export function AppProviders({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Memoize storage config to prevent FhevmProvider re-renders
  // Only instantiate IndexedDBStorage after component mounts (client-side only)
  const fhevmConfig = useMemo(() => {
    if (!mounted || typeof window === 'undefined') {
      return { storage: new MemoryStorage() };
    }
    return { storage: new IndexedDBStorage() };
  }, [mounted]);

  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
      <WagmiProvider config={wagmiConfig}>
        <QueryClientProvider client={queryClient}>
          <RainbowKitProvider>
            <FhevmProvider config={fhevmConfig}>
              <div className="flex flex-col min-h-screen">
                <Header />
                {children}
              </div>
            </FhevmProvider>
          </RainbowKitProvider>
        </QueryClientProvider>
      </WagmiProvider>
    </ThemeProvider>
  );
}
