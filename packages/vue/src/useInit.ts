import { ref, onUnmounted, computed, type Ref } from 'vue';
import type { InitParams, FhevmInstance, FhevmStatus } from '@fhevm/core';
import { FhevmAbortError } from '@fhevm/core';
import { useFhevmClient } from './plugin';

/**
 * useInit composable return type
 */
export interface UseInitReturn {
  /**
   * Initialize the FHEVM instance
   */
  init: (params: InitParams) => Promise<FhevmInstance | null>;

  /**
   * Current initialization status
   */
  status: Ref<FhevmStatus>;

  /**
   * FHEVM instance (null if not initialized)
   */
  instance: Ref<FhevmInstance | null>;

  /**
   * Error if initialization failed
   */
  error: Ref<Error | null>;

  /**
   * Cancel ongoing initialization
   */
  cancel: () => void;

  /**
   * Convenience computed properties
   */
  isIdle: Ref<boolean>;
  isLoading: Ref<boolean>;
  isReady: Ref<boolean>;
  isError: Ref<boolean>;
}

/**
 * useInit composable
 * Initialize the FHEVM instance with automatic cancellation on unmount
 *
 * @example
 * ```vue
 * <script setup>
 * import { useInit } from '@fhevm/vue';
 * import { BrowserProvider } from 'ethers';
 * import { onMounted } from 'vue';
 *
 * const { init, status, instance, error, isReady } = useInit();
 *
 * onMounted(async () => {
 *   const provider = new BrowserProvider(window.ethereum);
 *   await init({ provider });
 * });
 * </script>
 *
 * <template>
 *   <div v-if="isLoading">Loading...</div>
 *   <div v-else-if="error">Error: {{ error.message }}</div>
 *   <div v-else-if="isReady">FHEVM Ready!</div>
 * </template>
 * ```
 */
export function useInit(): UseInitReturn {
  const client = useFhevmClient();

  const status = ref<FhevmStatus>(client.getStatus());
  const instance = ref<FhevmInstance | null>(null);
  const error = ref<Error | null>(null);

  let abortController: AbortController | null = null;

  // Subscribe to status changes
  const unsubscribe = client.onStatusChange((newStatus) => {
    status.value = newStatus;
  });

  // Cancel function
  const cancel = () => {
    if (abortController) {
      abortController.abort();
      abortController = null;
    }
  };

  // Init function
  const init = async (params: InitParams): Promise<FhevmInstance | null> => {
    try {
      // Cancel any previous initialization
      cancel();

      // Clear previous error
      error.value = null;

      // Create new abort controller
      abortController = new AbortController();

      // Initialize
      const fhevmInstance = await client.init(params, abortController.signal);

      // Only update if not aborted
      if (!abortController.signal.aborted) {
        instance.value = fhevmInstance;
        return fhevmInstance;
      }

      return null;
    } catch (err) {
      // Don't set error for abort errors
      if (err instanceof FhevmAbortError) {
        return null;
      }

      error.value = err as Error;
      return null;
    }
  };

  // Computed convenience properties
  const isIdle = computed(() => status.value === 'idle');
  const isLoading = computed(() => status.value === 'loading');
  const isReady = computed(() => status.value === 'ready');
  const isError = computed(() => status.value === 'error');

  // Auto-cancel on unmount
  onUnmounted(() => {
    cancel();
    unsubscribe();
  });

  return {
    init,
    status,
    instance,
    error,
    cancel,
    isIdle,
    isLoading,
    isReady,
    isError,
  };
}
