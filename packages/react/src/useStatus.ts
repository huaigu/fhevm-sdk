import type { FhevmStatus } from '@0xbojack/fhevm-core';
import { useFhevmContext } from './FhevmContext';

/**
 * useStatus hook return type
 */
export interface UseStatusReturn {
  /**
   * Current FHEVM status
   */
  status: FhevmStatus;

  /**
   * Whether the FHEVM instance is idle
   */
  isIdle: boolean;

  /**
   * Whether the FHEVM instance is loading
   */
  isLoading: boolean;

  /**
   * Whether the FHEVM instance is ready
   */
  isReady: boolean;

  /**
   * Whether the FHEVM instance has an error
   */
  isError: boolean;
}

/**
 * useStatus hook
 * Get the current status of the FHEVM instance with convenience booleans
 *
 * @example
 * ```tsx
 * import { useStatus } from '@fhevm/react';
 *
 * function MyComponent() {
 *   const { status, isReady, isLoading, isError } = useStatus();
 *
 *   if (isLoading) return <div>Loading FHEVM...</div>;
 *   if (isError) return <div>Failed to initialize</div>;
 *   if (isReady) return <div>FHEVM is ready!</div>;
 *
 *   return <div>Status: {status}</div>;
 * }
 * ```
 */
export function useStatus(): UseStatusReturn {
  const { status } = useFhevmContext();

  return {
    status,
    isIdle: status === 'idle',
    isLoading: status === 'loading',
    isReady: status === 'ready',
    isError: status === 'error',
  };
}
