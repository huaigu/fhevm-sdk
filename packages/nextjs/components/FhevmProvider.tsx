"use client";

import { FhevmProvider as ReactFhevmProvider, IndexedDBStorage } from "@fhevm/react";

/**
 * FhevmProvider - Wrapper for @fhevm/react provider
 *
 * Provides FHEVM SDK context to the entire Next.js application.
 * Uses IndexedDBStorage for persistent key and signature caching.
 */
export function FhevmProvider({ children }: { children: React.ReactNode }) {
  return (
    <ReactFhevmProvider
      config={{
        storage: new IndexedDBStorage(),
      }}
    >
      {children as any}
    </ReactFhevmProvider>
  );
}
