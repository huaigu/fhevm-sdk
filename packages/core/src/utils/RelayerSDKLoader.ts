import { SDK_CDN_URL } from './constants';

type TraceFunction = (message?: unknown, ...optionalParams: unknown[]) => void;

/**
 * Type guard for checking if the relayer SDK is loaded and valid
 */
export interface FhevmRelayerSDK {
  initSDK(options?: unknown): Promise<boolean>;
  createInstance(config: unknown): Promise<unknown>;
  SepoliaConfig: {
    aclContractAddress: `0x${string}`;
    kmsVerifierContractAddress: `0x${string}`;
    inputVerifierContractAddress: `0x${string}`;
  };
  __initialized__?: boolean;
}

/**
 * Window interface extended with relayerSDK
 */
export interface FhevmWindow extends Window {
  relayerSDK: FhevmRelayerSDK;
}

/**
 * Utility to check if object has a specific property of a given type
 */
function objHasProperty<T extends object, K extends PropertyKey, V extends string>(
  obj: T,
  propertyName: K,
  propertyType: V,
  trace?: TraceFunction
): boolean {
  if (!obj || typeof obj !== 'object') {
    return false;
  }

  if (!(propertyName in obj)) {
    trace?.(`RelayerSDKLoader: missing ${String(propertyName)}.`);
    return false;
  }

  const value = (obj as Record<K, unknown>)[propertyName];

  if (value === null || value === undefined) {
    trace?.(`RelayerSDKLoader: ${String(propertyName)} is null or undefined.`);
    return false;
  }

  if (typeof value !== propertyType) {
    trace?.(`RelayerSDKLoader: ${String(propertyName)} is not a ${propertyType}.`);
    return false;
  }

  return true;
}

/**
 * Type guard for FhevmRelayerSDK
 */
function isFhevmRelayerSDK(o: unknown, trace?: TraceFunction): o is FhevmRelayerSDK {
  if (typeof o === 'undefined') {
    trace?.('RelayerSDKLoader: relayerSDK is undefined');
    return false;
  }
  if (o === null) {
    trace?.('RelayerSDKLoader: relayerSDK is null');
    return false;
  }
  if (typeof o !== 'object') {
    trace?.('RelayerSDKLoader: relayerSDK is not an object');
    return false;
  }
  if (!objHasProperty(o, 'initSDK', 'function', trace)) {
    trace?.('RelayerSDKLoader: relayerSDK.initSDK is invalid');
    return false;
  }
  if (!objHasProperty(o, 'createInstance', 'function', trace)) {
    trace?.('RelayerSDKLoader: relayerSDK.createInstance is invalid');
    return false;
  }
  if (!objHasProperty(o, 'SepoliaConfig', 'object', trace)) {
    trace?.('RelayerSDKLoader: relayerSDK.SepoliaConfig is invalid');
    return false;
  }
  if ('__initialized__' in o) {
    if (o.__initialized__ !== true && o.__initialized__ !== false) {
      trace?.('RelayerSDKLoader: relayerSDK.__initialized__ is invalid');
      return false;
    }
  }
  return true;
}

/**
 * Type guard for window with relayerSDK
 */
export function isFhevmWindow(win: unknown, trace?: TraceFunction): win is FhevmWindow {
  if (typeof win === 'undefined') {
    trace?.('RelayerSDKLoader: window object is undefined');
    return false;
  }
  if (win === null) {
    trace?.('RelayerSDKLoader: window object is null');
    return false;
  }
  if (typeof win !== 'object') {
    trace?.('RelayerSDKLoader: window is not an object');
    return false;
  }
  if (!('relayerSDK' in win)) {
    trace?.('RelayerSDKLoader: window does not contain relayerSDK property');
    return false;
  }
  return isFhevmRelayerSDK((win as FhevmWindow).relayerSDK, trace);
}

/**
 * Loads the Zama Relayer SDK from CDN
 * This class is framework-agnostic and only works in browser environments
 */
export class RelayerSDKLoader {
  private trace?: TraceFunction;

  constructor(options: { trace?: TraceFunction } = {}) {
    this.trace = options.trace;
  }

  /**
   * Check if the SDK is already loaded
   */
  public isLoaded(): boolean {
    if (typeof window === 'undefined') {
      throw new Error('RelayerSDKLoader: can only be used in the browser.');
    }
    return isFhevmWindow(window, this.trace);
  }

  /**
   * Load the Relayer SDK from CDN
   * Returns a promise that resolves when the SDK is loaded
   */
  public load(): Promise<void> {
    // Ensure this only runs in the browser
    if (typeof window === 'undefined') {
      return Promise.reject(
        new Error('RelayerSDKLoader: can only be used in the browser.')
      );
    }

    // Check if already loaded
    if ('relayerSDK' in window) {
      if (!isFhevmRelayerSDK((window as FhevmWindow).relayerSDK, this.trace)) {
        throw new Error('RelayerSDKLoader: Unable to load FHEVM Relayer SDK');
      }
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      const existingScript = document.querySelector(`script[src="${SDK_CDN_URL}"]`);
      if (existingScript) {
        if (!isFhevmWindow(window, this.trace)) {
          reject(
            new Error(
              'RelayerSDKLoader: window object does not contain a valid relayerSDK object.'
            )
          );
        }
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = SDK_CDN_URL;
      script.type = 'text/javascript';
      script.async = true;

      script.onload = () => {
        if (!isFhevmWindow(window, this.trace)) {
          reject(
            new Error(
              `RelayerSDKLoader: Relayer SDK script has been successfully loaded from ${SDK_CDN_URL}, however, the window.relayerSDK object is invalid.`
            )
          );
        }
        resolve();
      };

      script.onerror = () => {
        reject(
          new Error(`RelayerSDKLoader: Failed to load Relayer SDK from ${SDK_CDN_URL}`)
        );
      };

      document.head.appendChild(script);
    });
  }
}
