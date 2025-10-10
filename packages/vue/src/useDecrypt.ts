import { ref, type Ref } from 'vue';
import type { DecryptRequest, DecryptResult } from '@fhevm/core';
import type { JsonRpcSigner } from 'ethers';
import { useFhevmClient } from './plugin';

/**
 * useDecrypt composable return type
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
  data: Ref<DecryptResult | null>;

  /**
   * Loading state
   */
  isLoading: Ref<boolean>;

  /**
   * Error if decryption failed
   */
  error: Ref<Error | null>;

  /**
   * Reset state
   */
  reset: () => void;
}

/**
 * useDecrypt composable
 * Decrypt encrypted data (requires user signature)
 *
 * @example
 * ```vue
 * <script setup>
 * import { useDecrypt } from '@fhevm/vue';
 * import { BrowserProvider } from 'ethers';
 *
 * const { decrypt, data, isLoading, error } = useDecrypt();
 *
 * const handleDecrypt = async () => {
 *   const provider = new BrowserProvider(window.ethereum);
 *   const signer = await provider.getSigner();
 *
 *   await decrypt(
 *     [{ handle: '0x...', contractAddress: '0x...' }],
 *     signer
 *   );
 * };
 * </script>
 *
 * <template>
 *   <button @click="handleDecrypt" :disabled="isLoading">
 *     {{ isLoading ? 'Decrypting...' : 'Decrypt' }}
 *   </button>
 *   <pre v-if="data">{{ data }}</pre>
 *   <div v-if="error">Error: {{ error.message }}</div>
 * </template>
 * ```
 */
export function useDecrypt(): UseDecryptReturn {
  const client = useFhevmClient();

  const data = ref<DecryptResult | null>(null);
  const isLoading = ref(false);
  const error = ref<Error | null>(null);

  const decrypt = async (
    requests: DecryptRequest[],
    signer: JsonRpcSigner
  ): Promise<DecryptResult | null> => {
    try {
      isLoading.value = true;
      error.value = null;

      const result = await client.decrypt(requests, signer);

      data.value = result;
      return result;
    } catch (err) {
      error.value = err as Error;
      return null;
    } finally {
      isLoading.value = false;
    }
  };

  const reset = () => {
    data.value = null;
    error.value = null;
    isLoading.value = false;
  };

  return {
    decrypt,
    data,
    isLoading,
    error,
    reset,
  };
}
