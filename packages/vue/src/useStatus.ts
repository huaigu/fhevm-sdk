import { ref, computed, onUnmounted, type Ref } from 'vue';
import type { FhevmStatus } from '@0xbojack/fhevm-core';
import { useFhevmClient } from './plugin';

/**
 * useStatus composable return type
 */
export interface UseStatusReturn {
  /**
   * Current FHEVM status
   */
  status: Ref<FhevmStatus>;

  /**
   * Whether the FHEVM instance is idle
   */
  isIdle: Ref<boolean>;

  /**
   * Whether the FHEVM instance is loading
   */
  isLoading: Ref<boolean>;

  /**
   * Whether the FHEVM instance is ready
   */
  isReady: Ref<boolean>;

  /**
   * Whether the FHEVM instance has an error
   */
  isError: Ref<boolean>;
}

/**
 * useStatus composable
 * Get the current status of the FHEVM instance with convenience computed properties
 *
 * @example
 * ```vue
 * <script setup>
 * import { useStatus } from '@0xbojack/fhevm-vue';
 *
 * const { status, isReady, isLoading, isError } = useStatus();
 * </script>
 *
 * <template>
 *   <div v-if="isLoading">Loading FHEVM...</div>
 *   <div v-else-if="isError">Failed to initialize</div>
 *   <div v-else-if="isReady">FHEVM is ready!</div>
 *   <div v-else>Status: {{ status }}</div>
 * </template>
 * ```
 */
export function useStatus(): UseStatusReturn {
  const client = useFhevmClient();

  const status = ref<FhevmStatus>(client.getStatus());

  // Subscribe to status changes
  const unsubscribe = client.onStatusChange((newStatus) => {
    status.value = newStatus;
  });

  // Computed convenience properties
  const isIdle = computed(() => status.value === 'idle');
  const isLoading = computed(() => status.value === 'loading');
  const isReady = computed(() => status.value === 'ready');
  const isError = computed(() => status.value === 'error');

  // Cleanup on unmount
  onUnmounted(() => {
    unsubscribe();
  });

  return {
    status,
    isIdle,
    isLoading,
    isReady,
    isError,
  };
}
