import { useState, useEffect } from 'react';
import { useFhevmContext } from './FhevmContext';

/**
 * usePublicKey hook return type
 */
export interface UsePublicKeyReturn {
  /**
   * Public key for encryption (null if not ready)
   */
  publicKey: string | null;

  /**
   * Error if getting public key failed
   */
  error: Error | null;
}

/**
 * usePublicKey hook
 * Get the public key for encryption (only available after initialization)
 *
 * @example
 * ```tsx
 * import { usePublicKey } from '@0xbojack/fhevm-react';
 *
 * function MyComponent() {
 *   const { publicKey, error } = usePublicKey();
 *
 *   if (error) return <div>Error: {error.message}</div>;
 *   if (!publicKey) return <div>Not initialized</div>;
 *
 *   return <div>Public Key: {publicKey}</div>;
 * }
 * ```
 */
export function usePublicKey(): UsePublicKeyReturn {
  const { client, status } = useFhevmContext();
  const [publicKey, setPublicKey] = useState<string | null>(null);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (status === 'ready') {
      try {
        const key = client.getPublicKey();
        setPublicKey(key);
        setError(null);
      } catch (err) {
        setError(err as Error);
        setPublicKey(null);
      }
    } else {
      setPublicKey(null);
    }
  }, [client, status]);

  return {
    publicKey,
    error,
  };
}
