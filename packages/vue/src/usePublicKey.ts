import { ref, watchEffect, type Ref } from 'vue';
import { useFhevmClient } from './plugin';

/**
 * usePublicKey composable return type
 */
export interface UsePublicKeyReturn {
  /**
   * Public key for encryption (null if not ready)
   */
  publicKey: Ref<string | null>;

  /**
   * Error if getting public key failed
   */
  error: Ref<Error | null>;
}

/**
 * usePublicKey composable
 * Get the public key for encryption (only available after initialization)
 *
 * @example
 * ```vue
 * <script setup>
 * import { usePublicKey } from '@fhevm/vue';
 *
 * const { publicKey, error } = usePublicKey();
 * </script>
 *
 * <template>
 *   <div v-if="error">Error: {{ error.message }}</div>
 *   <div v-else-if="publicKey">Public Key: {{ publicKey }}</div>
 *   <div v-else>Not initialized</div>
 * </template>
 * ```
 */
export function usePublicKey(): UsePublicKeyReturn {
  const client = useFhevmClient();

  const publicKey = ref<string | null>(null);
  const error = ref<Error | null>(null);

  watchEffect(() => {
    const status = client.getStatus();
    if (status === 'ready') {
      try {
        publicKey.value = client.getPublicKey();
        error.value = null;
      } catch (err) {
        error.value = err as Error;
        publicKey.value = null;
      }
    } else {
      publicKey.value = null;
    }
  });

  return {
    publicKey,
    error,
  };
}
