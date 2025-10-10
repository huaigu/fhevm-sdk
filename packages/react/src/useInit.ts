import { useCallback, useState, useEffect, useRef } from 'react';
import type { InitParams, FhevmInstance, FhevmStatus } from '@fhevm/core';
import { FhevmAbortError } from '@fhevm/core';
import { useFhevmContext } from './FhevmContext';

/**
 * useInit hook return type
 */
export interface UseInitReturn {
  /**
   * Initialize the FHEVM instance
   */
  init: (params: InitParams) => Promise<FhevmInstance | null>;

  /**
   * Current initialization status
   */
  status: FhevmStatus;

  /**
   * FHEVM instance (null if not initialized)
   */
  instance: FhevmInstance | null;

  /**
   * Error if initialization failed
   */
  error: Error | null;

  /**
   * Cancel ongoing initialization
   */
  cancel: () => void;
}

/**
 * useInit hook
 * Initialize the FHEVM instance with automatic cancellation on unmount
 *
 * @example
 * ```tsx
 * import { useInit } from '@fhevm/react';
 * import { BrowserProvider } from 'ethers';
 *
 * function MyComponent() {
 *   const { init, status, instance, error } = useInit();
 *
 *   useEffect(() => {
 *     const provider = new BrowserProvider(window.ethereum);
 *     init({ provider });
 *   }, []);
 *
 *   if (status === 'loading') return <div>Loading...</div>;
 *   if (error) return <div>Error: {error.message}</div>;
 *   if (status === 'ready') return <div>FHEVM Ready!</div>;
 *
 *   return <button onClick={() => init({ provider })}>Initialize</button>;
 * }
 * ```
 */
export function useInit(): UseInitReturn {
  const { client, status } = useFhevmContext();
  const [instance, setInstance] = useState<FhevmInstance | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Cancel function
  const cancel = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
  }, []);

  // Init function
  const init = useCallback(
    async (params: InitParams): Promise<FhevmInstance | null> => {
      try {
        // Cancel any previous initialization
        cancel();

        // Clear previous error
        setError(null);

        // Create new abort controller
        const abortController = new AbortController();
        abortControllerRef.current = abortController;

        // Initialize
        const fhevmInstance = await client.init(params, abortController.signal);

        // Only update state if not aborted
        if (!abortController.signal.aborted) {
          setInstance(fhevmInstance);
          return fhevmInstance;
        }

        return null;
      } catch (err) {
        // Don't set error for abort errors
        if (err instanceof FhevmAbortError) {
          return null;
        }

        setError(err as Error);
        return null;
      }
    },
    [client, cancel]
  );

  // Auto-cancel on unmount
  useEffect(() => {
    return () => {
      cancel();
    };
  }, [cancel]);

  return {
    init,
    status,
    instance,
    error,
    cancel,
  };
}
