import { useCallback, useState } from 'react';
import type { DecryptRequest, DecryptResult } from '@0xbojack/fhevm-core';
import type { JsonRpcSigner } from 'ethers';
import { useFhevmContext } from './FhevmContext';

/**
 * useDecrypt hook return type
 */
export interface UseDecryptReturn {
  /**
   * Decrypt data
   */
  decrypt: (
    requests: DecryptRequest[],
    signer: JsonRpcSigner
  ) => Promise<DecryptResult | null>;

  /**
   * Decrypted result
   */
  data: DecryptResult | null;

  /**
   * Loading state
   */
  isLoading: boolean;

  /**
   * Error if decryption failed
   */
  error: Error | null;

  /**
   * Reset state
   */
  reset: () => void;
}

/**
 * useDecrypt hook
 * Decrypt encrypted data (requires user signature)
 *
 * @example
 * ```tsx
 * import { useDecrypt } from '@fhevm/react';
 * import { BrowserProvider } from 'ethers';
 *
 * function MyComponent() {
 *   const { decrypt, data, isLoading, error } = useDecrypt();
 *
 *   const handleDecrypt = async () => {
 *     const provider = new BrowserProvider(window.ethereum);
 *     const signer = await provider.getSigner();
 *
 *     const result = await decrypt(
 *       [
 *         { handle: '0x...', contractAddress: '0x...' },
 *       ],
 *       signer
 *     );
 *
 *     if (result) {
 *       console.log('Decrypted values:', result);
 *     }
 *   };
 *
 *   return (
 *     <div>
 *       <button onClick={handleDecrypt} disabled={isLoading}>
 *         {isLoading ? 'Decrypting...' : 'Decrypt'}
 *       </button>
 *       {data && <pre>{JSON.stringify(data, null, 2)}</pre>}
 *       {error && <div>Error: {error.message}</div>}
 *     </div>
 *   );
 * }
 * ```
 */
export function useDecrypt(): UseDecryptReturn {
  const { client } = useFhevmContext();
  const [data, setData] = useState<DecryptResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const decrypt = useCallback(
    async (
      requests: DecryptRequest[],
      signer: JsonRpcSigner
    ): Promise<DecryptResult | null> => {
      try {
        setIsLoading(true);
        setError(null);

        const result = await client.decrypt(requests, signer);

        setData(result);
        return result;
      } catch (err) {
        const error = err as Error;
        setError(error);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [client]
  );

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setIsLoading(false);
  }, []);

  return {
    decrypt,
    data,
    isLoading,
    error,
    reset,
  };
}
