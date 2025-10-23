<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useWallet } from '@/composables/useWallet';
import { useInit, useStatus, useEncrypt, useDecrypt } from '@fhevm/vue';
import { BrowserProvider, Contract } from 'ethers';
import { deployedContracts, type SupportedChainId } from '@/contracts/deployedContracts';

const { account, chainId, isConnected, provider } = useWallet();

// FHEVM composables
const { init, error: initError } = useInit();
const { isLoading: isInitializing, isReady } = useStatus();
const { encrypt } = useEncrypt();
const { decrypt, data: decryptedData, isLoading: isDecrypting, error: decryptError } = useDecrypt();

// Contract state
const contract = computed(() => {
  if (!chainId.value || !(chainId.value in deployedContracts)) return null;
  return deployedContracts[chainId.value as SupportedChainId].FHECounter;
});

// Counter state
const incrementValue = ref<number>(1);
const isSubmitting = ref(false);
const submitError = ref<string>('');

// User Decryption state (via Relayer)
const userDecrypted = ref<string>('');

// On-chain decryption state
const onChainRequestId = ref<string>('');
const onChainDecrypted = ref<string>('');
const isRequestingDecryption = ref(false);
const isPolling = ref(false);

// Auto-initialize when wallet connects
watch([isConnected, provider], async ([connected, prov]) => {
  if (connected && prov && !isReady.value && !isInitializing.value) {
    try {
      await init({ provider: window.ethereum as any });
    } catch (error) {
      console.error('Failed to initialize FHEVM:', error);
    }
  }
}, { immediate: true });

// Get contract instance
const getContractInstance = async () => {
  if (!provider.value || !contract.value) return null;

  const ethersProvider = new BrowserProvider(provider.value);
  const signer = await ethersProvider.getSigner();
  return new Contract(contract.value.address, contract.value.abi, signer);
};

// User Decryption (via Relayer SDK) - instant, client-side, private
const handleUserDecrypt = async () => {
  if (!isReady.value || !contract.value || !provider.value || !account.value) return;

  try {
    const contractInstance = await getContractInstance();
    if (!contractInstance || !contractInstance.getCount) {
      throw new Error('Failed to get contract instance');
    }

    // Get encrypted counter handle from contract
    const encryptedCountHandle = await contractInstance.getCount();

    // Decrypt using Relayer SDK
    const ethersProvider = new BrowserProvider(provider.value);
    const signer = await ethersProvider.getSigner();

    await decrypt(
      [{ handle: encryptedCountHandle, contractAddress: contract.value.address }],
      signer
    );
  } catch (error: any) {
    console.error('User decrypt failed:', error);
  }
};

// Increment counter - encrypt and submit in one action
const handleIncrement = async () => {
  if (!isReady.value || !contract.value || !account.value) return;

  try {
    isSubmitting.value = true;
    submitError.value = '';

    // Step 1: Encrypt the value
    const encrypted = await encrypt({
      value: incrementValue.value,
      type: 'euint32',
      contractAddress: contract.value.address,
      userAddress: account.value as `0x${string}`,
    });

    if (!encrypted) throw new Error('Encryption failed');

    // Step 2: Submit to contract
    const contractInstance = await getContractInstance();
    if (!contractInstance || !contractInstance.increment) {
      throw new Error('Failed to get contract instance');
    }

    const tx = await contractInstance.increment(
      encrypted.handles[0],
      encrypted.inputProof
    );

    await tx.wait();

    console.log('Increment transaction successful:', tx.hash);
  } catch (error: any) {
    console.error('Failed to increment:', error);
    submitError.value = error.message || 'Failed to increment counter';
  } finally {
    isSubmitting.value = false;
  }
};

// Watch for user decryption results
watch(decryptedData, (newData) => {
  if (newData !== undefined && newData !== null) {
    // Extract the first value from the decrypted data object
    userDecrypted.value = Object.values(newData)[0]?.toString() || 'N/A';
  }
});

// Request on-chain decryption
const handleRequestOnChainDecryption = async () => {
  if (!isReady.value || !contract.value || !provider.value) return;

  try {
    isRequestingDecryption.value = true;

    const contractInstance = await getContractInstance();
    if (!contractInstance || !contractInstance.requestDecryptCount) {
      throw new Error('Failed to get contract instance');
    }

    const tx = await contractInstance.requestDecryptCount();
    const receipt = await tx.wait();

    // Extract requestId from DecryptionRequested event
    const event = receipt.logs.find((log: any) => {
      try {
        const parsed = contractInstance.interface.parseLog(log);
        return parsed?.name === 'DecryptionRequested';
      } catch {
        return false;
      }
    });

    if (event) {
      const parsed = contractInstance.interface.parseLog(event);
      const requestId = parsed?.args.requestId.toString();
      onChainRequestId.value = requestId;

      // Start polling for result
      pollDecryptionResult(requestId, contractInstance);
    }
  } catch (error: any) {
    console.error('Failed to request on-chain decryption:', error);
  } finally {
    isRequestingDecryption.value = false;
  }
};

// Poll for decryption result with auto-update (3s intervals, 60s max)
const pollDecryptionResult = async (requestId: string, contractInstance: any) => {
  isPolling.value = true;
  onChainDecrypted.value = '0'; // Set initial value to show "processing" state

  const maxAttempts = 20; // 20 attempts * 3 seconds = 60 seconds (1 minute)
  let attempts = 0;
  const pollInterval = 3000; // Poll every 3 seconds

  const poll = async () => {
    try {
      // Get the decrypted value directly
      const decryptedValue = await contractInstance.getDecryptedCount(requestId);
      const valueStr = decryptedValue.toString();

      // Update the display with current value (even if 0)
      onChainDecrypted.value = valueStr;

      // Check if decryption is complete
      const isCompleted = await contractInstance.isDecryptionCompleted(requestId);

      if (isCompleted && valueStr !== '0') {
        // Decryption completed successfully
        console.log(`Decryption completed! Value: ${valueStr}`);
        isPolling.value = false;
        return;
      }

      attempts++;
      if (attempts < maxAttempts) {
        console.log(`Polling attempt ${attempts}/${maxAttempts}, current value: ${valueStr}`);
        setTimeout(poll, pollInterval);
      } else {
        console.warn('Polling timeout after 1 minute - callback may take longer');
        isPolling.value = false;
        // Keep the last fetched value displayed
      }
    } catch (error) {
      console.error('Polling error:', error);
      isPolling.value = false;
    }
  };

  // Start polling after a short delay to give the oracle time to process
  setTimeout(poll, 2000);
};
</script>

<template>
  <div class="counter-container">
    <div class="card">
      <h2>🔐 Encrypted Counter Demo</h2>
      <p class="description">
        Demonstration of @fhevm/vue composables for Fully Homomorphic Encryption
      </p>

      <!-- Connection Warning -->
      <div v-if="!isConnected" class="alert alert-warning">
        <strong>⚠️ Wallet Not Connected</strong>
        <p>Please connect your wallet to use FHEVM features</p>
      </div>

      <!-- Initialization Status -->
      <div v-else-if="isInitializing" class="alert alert-info">
        <div class="spinner"></div>
        <strong>Initializing FHEVM...</strong>
        <p>Setting up encryption keys and network connection</p>
      </div>

      <!-- Initialization Error -->
      <div v-else-if="initError" class="alert alert-error">
        <strong>❌ Initialization Error</strong>
        <p>{{ initError.message }}</p>
      </div>

      <!-- Network Status -->
      <div v-else-if="!contract" class="alert alert-warning">
        <strong>⚠️ Unsupported Network</strong>
        <p>Contract not deployed on this network. Please switch to Sepolia testnet.</p>
      </div>

      <!-- Ready State -->
      <div v-else-if="isReady && contract" class="demo-section">
        <!-- Network Info -->
        <div class="alert alert-info">
          <strong>ℹ️ Network Information</strong>
          <div class="network-info">
            <div>
              <strong>Network:</strong>
              {{ chainId === 11155111 ? 'Sepolia Testnet' : `Chain ID ${chainId}` }}
            </div>
            <div class="contract-address">
              Contract: {{ contract.address.slice(0, 6) }}...{{ contract.address.slice(-4) }}
            </div>
          </div>
        </div>

        <!-- Section 1: Increment Counter -->
        <div class="section-card">
          <h3 class="section-title">🔒 Increment Counter</h3>
          <div class="input-group">
            <label>Value to add (encrypted as euint32)</label>
            <input
              v-model.number="incrementValue"
              type="number"
              min="0"
              :disabled="!isReady || isSubmitting"
              placeholder="Enter a number"
            />
          </div>

          <button
            @click="handleIncrement"
            :disabled="!isReady || isSubmitting || !isConnected || !contract"
            class="primary full-width"
          >
            <span v-if="isSubmitting" class="spinner"></span>
            {{ isSubmitting ? 'Submitting...' : '🔒 Encrypt & Increment' }}
          </button>

          <!-- Submit Error -->
          <div v-if="submitError" class="alert alert-error">
            <strong>❌ Transaction Error</strong>
            <p>{{ submitError }}</p>
          </div>
        </div>

        <!-- Section 2: User Decryption (via Relayer SDK) -->
        <div class="section-card highlighted">
          <h3 class="section-title">🔓 User Decryption (via Relayer)</h3>
          <p class="section-description">
            Decrypt the current counter value instantly using the Relayer SDK.
            This requires a one-time signature and keeps the decrypted data client-side.
          </p>

          <button
            @click="handleUserDecrypt"
            :disabled="!isReady || isDecrypting || !isConnected || !contract"
            class="secondary full-width"
          >
            <span v-if="isDecrypting" class="spinner"></span>
            {{ isDecrypting ? 'Decrypting...' : '🔓 Decrypt via Relayer' }}
          </button>

          <!-- Decryption Error -->
          <div v-if="decryptError" class="alert alert-error">
            <strong>❌ Decryption Error</strong>
            <p>{{ decryptError.message }}</p>
          </div>

          <!-- Decrypted Result -->
          <div v-if="userDecrypted" class="alert alert-success">
            <strong>✅ Decrypted Counter Value</strong>
            <div class="result-value-large">{{ userDecrypted }}</div>
          </div>

          <div class="info-box">
            <p>
              <strong>How it works:</strong> The contract uses <code>FHE.allow()</code> to grant
              you permission to decrypt the counter value via the Relayer SDK.
            </p>
            <p>
              <strong>Benefits:</strong> ⚡ Instant result (no waiting), one-time signature (365 days), private client-side data.
            </p>
          </div>
        </div>

        <!-- Section 3: On-Chain Decryption (via Oracle) -->
        <div class="section-card highlighted">
          <h3 class="section-title">📡 Asynchronous On-Chain Decryption</h3>
          <p class="section-description">
            Request the decryption oracle to decrypt the encrypted counter value on-chain.
            The oracle needs time to process - the callback takes a few moments to complete.
          </p>

          <div class="alert alert-info blue">
            <strong>🔄 Auto-Polling:</strong> After requesting decryption, the app will automatically check for results
            every 3 seconds for up to 1 minute. You'll see the value update automatically when the oracle callback completes.
          </div>

          <button
            @click="handleRequestOnChainDecryption"
            :disabled="!isReady || isRequestingDecryption || isPolling || !isConnected || !contract"
            class="tertiary full-width"
          >
            <span v-if="isRequestingDecryption || isPolling" class="spinner"></span>
            {{
              isRequestingDecryption
                ? 'Requesting...'
                : isPolling
                ? 'Waiting for Oracle...'
                : '📡 Request On-Chain Decryption'
            }}
          </button>

          <!-- Request ID Display -->
          <div v-if="onChainRequestId" class="alert alert-info">
            <strong>Request ID:</strong>
            <code class="request-id">{{ onChainRequestId }}</code>
          </div>

          <!-- Decrypted Result Display -->
          <div v-if="onChainDecrypted" :class="['alert', onChainDecrypted === '0' ? 'alert-warning' : 'alert-success']">
            <strong>{{ onChainDecrypted === '0' ? '⏰ Callback Not Complete Yet' : '✅ On-Chain Decrypted Count' }}</strong>
            <div class="result-value-large">
              {{ onChainDecrypted }}
              <span v-if="onChainDecrypted === '0'" class="pending-badge">(pending)</span>
            </div>
            <div v-if="onChainDecrypted === '0'" class="warning-text">
              <p><strong>⏳ Oracle is processing...</strong> The decryption callback hasn't completed yet.</p>
              <p>When the value changes from 0 to the actual count, the decryption is complete.</p>
              <p>Auto-polling will continue checking every 3 seconds...</p>
            </div>
          </div>

          <div class="info-box">
            <p>
              <strong>How it works:</strong> The contract uses <code>FHE.requestDecryption()</code> to request on-chain decryption.
              The oracle processes the request and calls back with the decrypted value.
            </p>
            <p>
              <strong>Use case:</strong> When you need public, verifiable decryption results stored on-chain.
            </p>
          </div>
        </div>

        <!-- Comparison Table -->
        <div class="comparison-section">
          <h3>📊 Decryption Methods Comparison</h3>
          <table class="comparison-table">
            <thead>
              <tr>
                <th>Feature</th>
                <th>User Decryption (Relayer)</th>
                <th>On-Chain Decryption (Oracle)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Speed</strong></td>
                <td>⚡ Instant</td>
                <td>⏳ Async (few moments)</td>
              </tr>
              <tr>
                <td><strong>Visibility</strong></td>
                <td>🔒 Private (client-side)</td>
                <td>🌐 Public (on-chain)</td>
              </tr>
              <tr>
                <td><strong>Signature</strong></td>
                <td>✅ One-time (365 days)</td>
                <td>🔄 Per request</td>
              </tr>
              <tr>
                <td><strong>Use Case</strong></td>
                <td>Personal data viewing</td>
                <td>Public verification needed</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.counter-container {
  max-width: 1000px;
  margin: 2rem auto;
  padding: 0 1rem;
}

.description {
  opacity: 0.8;
  margin-bottom: 1.5rem;
}

.demo-section {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

/* Network Info */
.network-info {
  margin-top: 0.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}

.contract-address {
  font-size: 0.85rem;
  opacity: 0.7;
  font-family: 'Courier New', Courier, monospace;
}

/* Section Cards */
.section-card {
  background-color: hsl(var(--card, 0 0% 100%));
  border: 1px solid hsl(var(--border, 240 3.7% 15.9%));
  border-radius: 8px;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.section-card.highlighted {
  background-color: hsl(var(--card, 0 0% 100%));
  border: 1px solid hsl(var(--border, 240 3.7% 15.9%));
}

.section-title {
  margin: 0;
  font-size: 1.3rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.section-description {
  margin: 0;
  opacity: 0.7;
  font-size: 0.9rem;
}

/* Input Groups */
.input-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.input-group label {
  font-size: 0.9rem;
  font-weight: 500;
}

/* Buttons */
button.full-width {
  width: 100%;
}

button.primary {
  background-color: #42b883;
  color: #fff;
}

button.secondary {
  background-color: #3b82f6;
  color: #fff;
}

button.tertiary {
  background-color: #8b5cf6;
  color: #fff;
}

/* Info Boxes */
.info-box {
  font-size: 0.85rem;
  color: hsl(var(--muted-foreground, 240 3.8% 46.1%));
  padding: 1rem;
  background-color: transparent;
  border-radius: 4px;
  border-top: 1px solid hsl(var(--border, 240 3.7% 15.9%));
  padding-top: 1rem;
  margin-top: 0.5rem;
}

.info-box p {
  margin: 0.5rem 0;
  line-height: 1.5;
}

.info-box code {
  background-color: hsl(var(--muted, 240 3.7% 15.9%));
  padding: 0.2rem 0.4rem;
  border-radius: 3px;
  font-size: 0.9em;
}

/* Alerts */
.alert.blue {
  background-color: #dbeafe;
  border-color: #93c5fd;
  color: #1e40af;
}

.alert.alert-warning {
  background-color: #fef3c7;
  border-color: #fcd34d;
  color: #92400e;
}

.alert.alert-success {
  background-color: #d1fae5;
  border-color: #6ee7b7;
  color: #065f46;
}

/* Result Values */
.result-value-large {
  font-size: 2.5rem;
  font-weight: 700;
  color: #42b883;
  margin-top: 0.5rem;
  text-align: center;
}

.pending-badge {
  font-size: 0.9rem;
  opacity: 0.6;
  margin-left: 0.5rem;
}

.warning-text {
  font-size: 0.85rem;
  margin-top: 1rem;
  opacity: 0.8;
}

.warning-text p {
  margin: 0.3rem 0;
}

.request-id {
  font-size: 0.85rem;
  word-break: break-all;
}

/* Comparison Table */
.comparison-section {
  background-color: hsl(var(--card, 0 0% 100%));
  border: 1px solid hsl(var(--border, 240 3.7% 15.9%));
  border-radius: 8px;
  padding: 1.5rem;
}

.comparison-section h3 {
  margin-top: 0;
  margin-bottom: 1rem;
}

.comparison-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.9rem;
}

.comparison-table th,
.comparison-table td {
  padding: 0.75rem;
  text-align: left;
  border-bottom: 1px solid hsl(var(--border, 240 3.7% 15.9%));
}

.comparison-table thead th {
  background-color: hsl(var(--muted, 240 3.7% 15.9%));
  font-weight: 600;
  color: hsl(var(--foreground, 0 0% 98%));
}

.comparison-table tbody tr:hover {
  background-color: hsl(var(--muted, 240 3.7% 15.9%) / 0.3);
}

.comparison-table tbody td:first-child {
  font-weight: 500;
}

/* Responsive */
@media (max-width: 768px) {
  .result-value-large {
    font-size: 2rem;
  }

  .comparison-table {
    font-size: 0.8rem;
  }

  .comparison-table th,
  .comparison-table td {
    padding: 0.5rem;
  }
}
</style>
