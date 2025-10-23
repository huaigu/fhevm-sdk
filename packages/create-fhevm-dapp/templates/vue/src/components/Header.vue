<script setup lang="ts">
import { computed } from 'vue';
import { useWallet } from '@/composables/useWallet';

const { account, chainId, isConnected, connect, disconnect } = useWallet();

const networkName = computed(() => {
  if (!chainId.value) return 'Not Connected';
  switch (chainId.value) {
    case 11155111:
      return 'Sepolia Testnet';
    case 31337:
      return 'Hardhat Local';
    default:
      return `Chain ID ${chainId.value}`;
  }
});

const shortAddress = computed(() => {
  if (!account.value) return '';
  return `${account.value.slice(0, 6)}...${account.value.slice(-4)}`;
});
</script>

<template>
  <header class="header">
    <div class="container">
      <div class="brand">
        <h1>🔐 FHEVM SDK</h1>
        <span class="framework">Vue 3</span>
      </div>

      <div class="wallet-info">
        <div v-if="isConnected" class="network">
          <span class="network-label">Network:</span>
          <span class="network-name">{{ networkName }}</span>
        </div>

        <button
          v-if="!isConnected"
          @click="connect"
          class="primary"
        >
          Connect Wallet
        </button>

        <div v-else class="account-info">
          <span class="address">{{ shortAddress }}</span>
          <button @click="disconnect" class="secondary">Disconnect</button>
        </div>
      </div>
    </div>
  </header>
</template>

<style scoped>
.header {
  background-color: hsl(var(--background, 0 0% 100%) / 0.95);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border-bottom: 1px solid hsl(var(--border, 240 3.7% 15.9%) / 0.4);
  padding: 1rem 0;
  position: sticky;
  top: 0;
  z-index: 100;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 2rem;
}

.brand {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.brand h1 {
  font-size: 1.5rem;
  margin: 0;
  color: hsl(var(--foreground, 0 0% 98%));
}

.framework {
  background-color: #42b883;
  color: white;
  padding: 0.3rem 0.6rem;
  border-radius: 4px;
  font-size: 0.85rem;
  font-weight: 600;
}

.wallet-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.network {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background-color: hsl(var(--muted, 240 3.7% 15.9%) / 0.5);
  border: 1px solid hsl(var(--border, 240 3.7% 15.9%));
  border-radius: 6px;
}

.network-label {
  font-size: 0.9rem;
  color: hsl(var(--muted-foreground, 240 3.8% 46.1%));
}

.network-name {
  font-weight: 600;
  color: #42b883;
}

.account-info {
  display: flex;
  align-items: center;
  gap: 0.8rem;
}

.address {
  padding: 0.5rem 1rem;
  background-color: hsl(var(--muted, 240 3.7% 15.9%) / 0.5);
  border: 1px solid hsl(var(--border, 240 3.7% 15.9%));
  border-radius: 6px;
  font-family: 'Courier New', Courier, monospace;
  color: hsl(var(--foreground, 0 0% 98%));
  font-size: 0.9rem;
}

@media (max-width: 768px) {
  .container {
    flex-direction: column;
    align-items: stretch;
  }

  .wallet-info {
    flex-direction: column;
    align-items: stretch;
  }

  .network {
    justify-content: space-between;
  }
}
</style>
