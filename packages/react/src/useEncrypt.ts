import { useCallback, useState } from 'react';
import type { EncryptParams, EncryptResult } from '@0xbojack/fhevm-core';
import { useFhevmContext } from './FhevmContext';

/**
 * useEncrypt hook return type
 */
export interface UseEncryptReturn {
  /**
   * Encrypt data
   */
  encrypt: (params: EncryptParams) => Promise<EncryptResult | null>;

  /**
   * Encrypted result
   */
  data: EncryptResult | null;

  /**
   * Loading state
   */
  isLoading: boolean;

  /**
   * Error if encryption failed
   */
  error: Error | null;

  /**
   * Reset state
   */
  reset: () => void;
}

/**
 * useEncrypt hook
 * Encrypt data for on-chain computation
 *
 * @example
 * ```tsx
 * import { useEncrypt } from '@0xbojack/fhevm-react';
 *
 * function MyComponent() {
 *   const { encrypt, data, isLoading, error } = useEncrypt();
 *
 *   const handleEncrypt = async () => {
 *     const result = await encrypt({
 *       value: 42,
 *       type: 'euint32',
 *       contractAddress: '0x...',
 *       userAddress: '0x...',
 *     });
 *
 *     if (result) {
 *       // Use result.handles and result.inputProof
 *       console.log('Encrypted:', result);
 *     }
 *   };
 *
 *   return (
 *     <button onClick={handleEncrypt} disabled={isLoading}>
 *       {isLoading ? 'Encrypting...' : 'Encrypt'}
 *     </button>
 *   );
 * }
 * ```
 */
export function useEncrypt(): UseEncryptReturn {
  const { client } = useFhevmContext();
  const [data, setData] = useState<EncryptResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const encrypt = useCallback(
    async (params: EncryptParams): Promise<EncryptResult | null> => {
      try {
        setIsLoading(true);
        setError(null);

        const result = await client.encrypt(params);

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
    encrypt,
    data,
    isLoading,
    error,
    reset,
  };
}
