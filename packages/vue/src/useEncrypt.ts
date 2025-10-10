import { ref, type Ref } from 'vue';
import type { EncryptParams, EncryptResult } from '@fhevm/core';
import { useFhevmClient } from './plugin';

/**
 * useEncrypt composable return type
 */
export interface UseEncryptReturn {
  /**
   * Encrypt data
   */
  encrypt: (params: EncryptParams) => Promise<EncryptResult | null>;

  /**
   * Encrypted result
   */
  data: Ref<EncryptResult | null>;

  /**
   * Loading state
   */
  isLoading: Ref<boolean>;

  /**
   * Error if encryption failed
   */
  error: Ref<Error | null>;

  /**
   * Reset state
   */
  reset: () => void;
}

/**
 * useEncrypt composable
 * Encrypt data for on-chain computation
 *
 * @example
 * ```vue
 * <script setup>
 * import { useEncrypt } from '@fhevm/vue';
 *
 * const { encrypt, data, isLoading, error } = useEncrypt();
 *
 * const handleEncrypt = async () => {
 *   await encrypt({
 *     value: 42,
 *     type: 'euint32',
 *     contractAddress: '0x...',
 *     userAddress: '0x...',
 *   });
 * };
 * </script>
 *
 * <template>
 *   <button @click="handleEncrypt" :disabled="isLoading">
 *     {{ isLoading ? 'Encrypting...' : 'Encrypt' }}
 *   </button>
 *   <pre v-if="data">{{ data }}</pre>
 *   <div v-if="error">Error: {{ error.message }}</div>
 * </template>
 * ```
 */
export function useEncrypt(): UseEncryptReturn {
  const client = useFhevmClient();

  const data = ref<EncryptResult | null>(null);
  const isLoading = ref(false);
  const error = ref<Error | null>(null);

  const encrypt = async (params: EncryptParams): Promise<EncryptResult | null> => {
    try {
      isLoading.value = true;
      error.value = null;

      const result = await client.encrypt(params);

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
    encrypt,
    data,
    isLoading,
    error,
    reset,
  };
}
