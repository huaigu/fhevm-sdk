import { inject, provide, type App, type InjectionKey } from 'vue';
import { FhevmClient, type FhevmConfig } from '@0xbojack/fhevm-core';

/**
 * Injection key for FHEVM client
 */
export const FhevmClientKey: InjectionKey<FhevmClient> = Symbol('FhevmClient');

/**
 * FHEVM plugin options
 */
export interface FhevmPluginOptions {
  config?: FhevmConfig;
}

/**
 * FHEVM Vue plugin
 * Provides FHEVM client instance to the Vue app
 *
 * @example
 * ```ts
 * import { createApp } from 'vue';
 * import { createFhevm } from '@0xbojack/fhevm-vue';
 * import { IndexedDBStorage } from '@0xbojack/fhevm-core';
 *
 * const app = createApp(App);
 * const fhevm = createFhevm({
 *   config: { storage: new IndexedDBStorage() }
 * });
 * app.use(fhevm);
 * ```
 */
export function createFhevm(options: FhevmPluginOptions = {}) {
  const client = new FhevmClient(options.config);

  return {
    install(app: App) {
      app.provide(FhevmClientKey, client);
    },
  };
}

/**
 * Use FHEVM client
 * Access the FHEVM client from the Vue app
 *
 * @throws Error if used outside of a Vue app with FHEVM plugin
 */
export function useFhevmClient(): FhevmClient {
  const client = inject(FhevmClientKey);

  if (!client) {
    throw new Error(
      'useFhevmClient must be used in a Vue app with FHEVM plugin installed. ' +
        'Make sure to call app.use(createFhevm()) in your main.ts'
    );
  }

  return client;
}
