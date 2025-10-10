/**
 * CDN URL for the Zama Relayer SDK
 * @see https://docs.zama.ai/fhevm
 */
export const SDK_CDN_URL =
  'https://cdn.zama.ai/relayer-sdk-js/0.2.0/relayer-sdk-js.umd.cjs';

/**
 * Default mock chain configurations
 * ChainId 31337 is the default Hardhat local development network
 */
export const DEFAULT_MOCK_CHAINS: Record<number, string> = {
  31337: 'http://localhost:8545',
};
