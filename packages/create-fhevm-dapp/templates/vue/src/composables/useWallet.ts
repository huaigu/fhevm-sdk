import { ref, computed, onMounted, onUnmounted } from 'vue';
import type { Eip1193Provider } from 'ethers';

/**
 * Composable for wallet connection state
 * Manages connection to window.ethereum and tracks account/network changes
 */
export function useWallet() {
  const account = ref<string | null>(null);
  const chainId = ref<number | null>(null);
  const isConnected = computed(() => account.value !== null);
  const provider = ref<Eip1193Provider | null>(null);

  // Connect wallet
  const connect = async () => {
    if (typeof window === 'undefined' || !window.ethereum) {
      throw new Error('No Ethereum provider found. Please install MetaMask.');
    }

    try {
      provider.value = window.ethereum as unknown as Eip1193Provider;

      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      }) as string[];

      if (accounts.length > 0) {
        account.value = accounts[0] || null;
      }

      // Get chain ID
      const chainIdHex = await window.ethereum.request({
        method: 'eth_chainId',
      }) as string;
      chainId.value = parseInt(chainIdHex, 16);
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      throw error;
    }
  };

  // Disconnect wallet
  const disconnect = () => {
    account.value = null;
    chainId.value = null;
    provider.value = null;
  };

  // Handle account changes
  const handleAccountsChanged = (accounts: string[]) => {
    if (accounts.length === 0) {
      disconnect();
    } else {
      account.value = accounts[0] || null;
    }
  };

  // Handle chain changes
  const handleChainChanged = (chainIdHex: string) => {
    chainId.value = parseInt(chainIdHex, 16);
    // Reload page on network change (recommended by MetaMask)
    window.location.reload();
  };

  // Setup event listeners
  onMounted(async () => {
    if (typeof window !== 'undefined' && window.ethereum) {
      // Check if already connected
      try {
        const accounts = await window.ethereum.request({
          method: 'eth_accounts',
        }) as string[];

        if (accounts.length > 0) {
          account.value = accounts[0] || null;
          provider.value = window.ethereum as unknown as Eip1193Provider;

          const chainIdHex = await window.ethereum.request({
            method: 'eth_chainId',
          }) as string;
          chainId.value = parseInt(chainIdHex, 16);
        }
      } catch (error) {
        console.error('Failed to get accounts:', error);
      }

      // Listen for account changes
      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);
    }
  });

  // Cleanup event listeners
  onUnmounted(() => {
    if (typeof window !== 'undefined' && window.ethereum) {
      window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
      window.ethereum.removeListener('chainChanged', handleChainChanged);
    }
  });

  return {
    account,
    chainId,
    isConnected,
    provider,
    connect,
    disconnect,
  };
}
