import { createContext, useContext, ReactNode, useMemo, useCallback, useState } from 'react';
import { FhevmClient, type FhevmConfig, type FhevmStatus } from '@0xbojack/fhevm-core';

/**
 * FHEVM Context value
 */
export interface FhevmContextValue {
  client: FhevmClient;
  status: FhevmStatus;
}

/**
 * FHEVM Context
 */
const FhevmContext = createContext<FhevmContextValue | null>(null);

/**
 * FhevmProvider props
 */
export interface FhevmProviderProps {
  children: ReactNode;
  config?: FhevmConfig;
}

/**
 * FhevmProvider component
 * Provides FHEVM client instance to the React component tree
 *
 * @example
 * ```tsx
 * import { FhevmProvider } from '@0xbojack/fhevm-react';
 * import { IndexedDBStorage } from '@0xbojack/fhevm-core';
 *
 * function App() {
 *   return (
 *     <FhevmProvider config={{ storage: new IndexedDBStorage() }}>
 *       <YourApp />
 *     </FhevmProvider>
 *   );
 * }
 * ```
 */
export function FhevmProvider({ children, config }: FhevmProviderProps) {
  // Create client instance once
  const client = useMemo(() => new FhevmClient(config), [config]);

  // Track status
  const [status, setStatus] = useState<FhevmStatus>(client.getStatus());

  // Subscribe to status changes
  useMemo(() => {
    const unsubscribe = client.onStatusChange(setStatus);
    return () => unsubscribe();
  }, [client]);

  const value = useMemo<FhevmContextValue>(
    () => ({ client, status }),
    [client, status]
  );

  return <FhevmContext.Provider value={value}>{children}</FhevmContext.Provider>;
}

/**
 * useFhevmContext hook
 * Access the FHEVM client and status from context
 *
 * @throws Error if used outside of FhevmProvider
 */
export function useFhevmContext(): FhevmContextValue {
  const context = useContext(FhevmContext);

  if (!context) {
    throw new Error('useFhevmContext must be used within a FhevmProvider');
  }

  return context;
}
