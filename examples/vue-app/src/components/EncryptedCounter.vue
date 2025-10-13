<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useWallet } from '@/composables/useWallet';
import { useInit, useStatus, useEncrypt, useDecrypt, usePublicKey } from '@fhevm/vue';
import { BrowserProvider, Contract } from 'ethers';
import { deployedContracts, type SupportedChainId } from '@/contracts/deployedContracts';

const { account, chainId, isConnected, provider } = useWallet();

// FHEVM composables
const { init, error: initError } = useInit();
const { isLoading: isInitializing, isReady } = useStatus();
const { publicKey } = usePublicKey();
const { encrypt, error: encryptError } = useEncrypt();
const { decrypt, data: decryptedData, isLoading: isDecrypting, error: decryptError } = useDecrypt();

// Contract state
const contract = computed(() => {
  if (!chainId.value || !(chainId.value in deployedContracts)) return null;
  return deployedContracts[chainId.value as SupportedChainId].FHECounter;
});

// Counter state
const incrementValue = ref<number>(1);
const decrementValue = ref<number>(1);
const encryptedCount = ref<string>('');
const decryptedCount = ref<string>('');
const isTransacting = ref(false);
const txError = ref<string>('');

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

// Read encrypted count from contract
const readCount = async () => {
  if (!isReady.value || !contract.value || !provider.value) return;

  try {
    isTransacting.value = true;
    txError.value = '';

    const contractInstance = await getContractInstance();
    if (!contractInstance || !contractInstance.getCount) {
      throw new Error('Failed to get contract instance');
    }

    const count = await contractInstance.getCount();
    encryptedCount.value = count.toString();

    // Decrypt the count
    const ethersProvider = new BrowserProvider(provider.value);
    const signer = await ethersProvider.getSigner();

    await decrypt(
      [{ handle: count, contractAddress: contract.value.address }],
      signer
    );
  } catch (error: any) {
    console.error('Failed to read count:', error);
    txError.value = error.message || 'Failed to read count';
  } finally {
    isTransacting.value = false;
  }
};

// Increment counter
const handleIncrement = async () => {
  if (!isReady.value || !contract.value || !account.value) return;

  try {
    isTransacting.value = true;
    txError.value = '';

    // Encrypt the increment value
    const encrypted = await encrypt({
      value: incrementValue.value,
      type: 'euint32',
      contractAddress: contract.value.address,
      userAddress: account.value as `0x${string}`,
    });

    if (!encrypted) throw new Error('Encryption failed');

    // Send transaction
    const contractInstance = await getContractInstance();
    if (!contractInstance || !contractInstance.increment) {
      throw new Error('Failed to get contract instance');
    }

    const tx = await contractInstance.increment(
      encrypted.handles[0],
      encrypted.inputProof
    );

    await tx.wait();

    // Read updated count
    await readCount();
  } catch (error: any) {
    console.error('Failed to increment:', error);
    txError.value = error.message || 'Failed to increment counter';
  } finally {
    isTransacting.value = false;
  }
};

// Decrement counter
const handleDecrement = async () => {
  if (!isReady.value || !contract.value || !account.value) return;

  try {
    isTransacting.value = true;
    txError.value = '';

    // Encrypt the decrement value
    const encrypted = await encrypt({
      value: decrementValue.value,
      type: 'euint32',
      contractAddress: contract.value.address,
      userAddress: account.value as `0x${string}`,
    });

    if (!encrypted) throw new Error('Encryption failed');

    // Send transaction
    const contractInstance = await getContractInstance();
    if (!contractInstance || !contractInstance.decrement) {
      throw new Error('Failed to get contract instance');
    }

    const tx = await contractInstance.decrement(
      encrypted.handles[0],
      encrypted.inputProof
    );

    await tx.wait();

    // Read updated count
    await readCount();
  } catch (error: any) {
    console.error('Failed to decrement:', error);
    txError.value = error.message || 'Failed to decrement counter';
  } finally {
    isTransacting.value = false;
  }
};

// Watch for decryption results
watch(decryptedData, (newData) => {
  if (newData !== undefined && newData !== null) {
    decryptedCount.value = newData.toString();
  }
});

// Request on-chain decryption
const handleRequestOnChainDecryption = async () => {
  if (!isReady.value || !contract.value || !provider.value) return;

  try {
    isRequestingDecryption.value = true;
    txError.value = '';

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
    txError.value = error.message || 'Failed to request on-chain decryption';
  } finally {
    isRequestingDecryption.value = false;
  }
};

// Poll for decryption result
const pollDecryptionResult = async (requestId: string, contractInstance: any) => {
  isPolling.value = true;
  const maxAttempts = 30;
  let attempts = 0;

  const poll = async () => {
    try {
      const isCompleted = await contractInstance.isDecryptionCompleted(requestId);

      if (isCompleted) {
        const decryptedValue = await contractInstance.getDecryptedCount(requestId);
        onChainDecrypted.value = decryptedValue.toString();
        isPolling.value = false;
        return;
      }

      attempts++;
      if (attempts < maxAttempts) {
        setTimeout(poll, 2000); // Poll every 2 seconds
      } else {
        console.error('Polling timeout - decryption taking too long');
        isPolling.value = false;
      }
    } catch (error) {
      console.error('Polling error:', error);
      isPolling.value = false;
    }
  };

  poll();
};
</script>

<template>
  <div class="counter-container">
    <div class="card">
      <h2>🔐 Encrypted Counter Demo</h2>
      <p class="description">
        Fully Homomorphic Encryption (FHE) allows computation on encrypted data without decryption.
        This demo showcases all FHEVM SDK composables in action.
      </p>

      <!-- Network Status -->
      <div v-if="!contract" class="alert alert-warning">
        <strong>⚠️ Unsupported Network</strong>
        <p>Please switch to Sepolia Testnet or Local Hardhat Network</p>
      </div>

      <!-- Connection Status -->
      <div v-if="!isConnected" class="alert alert-info">
        <strong>👋 Welcome!</strong>
        <p>Connect your wallet to interact with the encrypted counter</p>
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

      <!-- Ready State -->
      <div v-else-if="isReady && contract" class="demo-section">
        <!-- Status Info -->
        <div class="status-grid">
          <div class="status-item">
            <span class="status-label">SDK Status:</span>
            <span class="status-value success">✅ Ready</span>
          </div>
          <div class="status-item">
            <span class="status-label">Public Key:</span>
            <span class="status-value">{{ publicKey ? '✅ Loaded' : '⏳ Loading...' }}</span>
          </div>
          <div class="status-item">
            <span class="status-label">Contract:</span>
            <span class="status-value code">{{ contract.address.slice(0, 10) }}...</span>
          </div>
        </div>

        <div class="divider"></div>

        <!-- Counter Display -->
        <div class="counter-display">
          <h3>Current Count</h3>
          <div v-if="decryptedCount" class="count-value">
            {{ decryptedCount }}
          </div>
          <div v-else class="count-placeholder">
            Click "Read Count" to decrypt the current value
          </div>
          <button
            @click="readCount"
            :disabled="isTransacting || isDecrypting"
            class="primary"
          >
            <span v-if="isTransacting || isDecrypting" class="spinner"></span>
            {{ isDecrypting ? 'Decrypting...' : 'Read Count' }}
          </button>
          <div v-if="encryptedCount" class="encrypted-info">
            <code>Encrypted: {{ encryptedCount.slice(0, 20) }}...</code>
          </div>
        </div>

        <div class="divider"></div>

        <!-- Operations -->
        <div class="operations-grid">
          <!-- Increment -->
          <div class="operation-card">
            <h3>➕ Increment</h3>
            <p>Encrypt a value and add it to the counter</p>
            <div class="input-group">
              <label>Amount:</label>
              <input
                v-model.number="incrementValue"
                type="number"
                min="1"
                :disabled="isTransacting"
              />
            </div>
            <button
              @click="handleIncrement"
              :disabled="isTransacting || !publicKey"
              class="primary"
            >
              <span v-if="isTransacting" class="spinner"></span>
              {{ isTransacting ? 'Processing...' : 'Increment' }}
            </button>
          </div>

          <!-- Decrement -->
          <div class="operation-card">
            <h3>➖ Decrement</h3>
            <p>Encrypt a value and subtract it from the counter</p>
            <div class="input-group">
              <label>Amount:</label>
              <input
                v-model.number="decrementValue"
                type="number"
                min="1"
                :disabled="isTransacting"
              />
            </div>
            <button
              @click="handleDecrement"
              :disabled="isTransacting || !publicKey"
              class="secondary"
            >
              <span v-if="isTransacting" class="spinner"></span>
              {{ isTransacting ? 'Processing...' : 'Decrement' }}
            </button>
          </div>
        </div>

        <!-- Errors -->
        <div v-if="txError" class="alert alert-error">
          <strong>❌ Transaction Error</strong>
          <p>{{ txError }}</p>
        </div>
        <div v-if="encryptError" class="alert alert-error">
          <strong>❌ Encryption Error</strong>
          <p>{{ encryptError.message }}</p>
        </div>
        <div v-if="decryptError" class="alert alert-error">
          <strong>❌ Decryption Error</strong>
          <p>{{ decryptError.message }}</p>
        </div>

        <!-- On-Chain Decryption -->
        <div class="divider"></div>
        <div class="onchain-section">
          <h3>🔓 Asynchronous On-Chain Decryption</h3>
          <p class="info-text">
            Request the decryption oracle to decrypt the encrypted counter value on-chain.
            The result will be available after the oracle processes the request.
          </p>

          <button
            @click="handleRequestOnChainDecryption"
            :disabled="isRequestingDecryption || isPolling || isTransacting"
            class="primary"
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

          <div v-if="onChainRequestId" class="alert alert-info">
            <strong>Request ID:</strong>
            <code>{{ onChainRequestId }}</code>
          </div>

          <div v-if="onChainDecrypted" class="onchain-result">
            <div class="result-label">✅ On-Chain Decrypted Count:</div>
            <div class="result-value">{{ onChainDecrypted }}</div>
          </div>

          <div class="info-note">
            <p>
              <strong>Note:</strong> This demonstrates asynchronous on-chain decryption using
              FHE.requestDecryption().
            </p>
            <p>
              The decryption oracle processes the request and calls back the contract with the
              decrypted value.
            </p>
          </div>
        </div>

        <!-- Composables Demo -->
        <div class="divider"></div>
        <div class="composables-info">
          <h3>🎯 FHEVM Vue Composables in Action</h3>
          <div class="composables-grid">
            <div class="composable-item">
              <code>useInit()</code>
              <span>Initialize SDK with provider</span>
            </div>
            <div class="composable-item">
              <code>useStatus()</code>
              <span>Track initialization status</span>
            </div>
            <div class="composable-item">
              <code>usePublicKey()</code>
              <span>Get encryption public key</span>
            </div>
            <div class="composable-item">
              <code>useEncrypt()</code>
              <span>Encrypt values for transactions</span>
            </div>
            <div class="composable-item">
              <code>useDecrypt()</code>
              <span>Decrypt contract data</span>
            </div>
            <div class="composable-item">
              <code>requestDecryptCount()</code>
              <span>Request on-chain decryption via oracle</span>
            </div>
          </div>
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

.status-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.status-item {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}

.status-label {
  font-size: 0.9rem;
  opacity: 0.7;
}

.status-value {
  font-weight: 600;
}

.status-value.success {
  color: #10b981;
}

.status-value.code {
  font-family: 'Courier New', Courier, monospace;
  font-size: 0.9rem;
}

.counter-display {
  text-align: center;
  padding: 2rem;
  background-color: #0d1117;
  border-radius: 8px;
}

.counter-display h3 {
  margin-bottom: 1rem;
  opacity: 0.8;
}

.count-value {
  font-size: 4rem;
  font-weight: 700;
  color: #42b883;
  margin: 1rem 0;
}

.count-placeholder {
  font-size: 1.2rem;
  opacity: 0.6;
  margin: 2rem 0;
}

.encrypted-info {
  margin-top: 1rem;
  font-size: 0.85rem;
  opacity: 0.6;
}

.operations-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
}

.operation-card {
  background-color: #0d1117;
  border-radius: 8px;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.operation-card h3 {
  margin: 0;
}

.operation-card p {
  margin: 0;
  opacity: 0.7;
  font-size: 0.9rem;
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.input-group label {
  font-size: 0.9rem;
  font-weight: 500;
}

.composables-info {
  background-color: #0d1117;
  border-radius: 8px;
  padding: 1.5rem;
}

.composables-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-top: 1rem;
}

.composable-item {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  padding: 0.8rem;
  background-color: #1a1a1a;
  border-radius: 4px;
}

.composable-item code {
  color: #42b883;
  font-weight: 600;
}

.composable-item span {
  font-size: 0.85rem;
  opacity: 0.7;
}

.onchain-section {
  background-color: #0d1117;
  border-radius: 8px;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.onchain-section h3 {
  margin: 0;
}

.info-text {
  opacity: 0.7;
  font-size: 0.9rem;
  margin: 0;
}

.onchain-result {
  background-color: #1a1a1a;
  border-radius: 8px;
  padding: 1.5rem;
  text-align: center;
}

.result-label {
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: #10b981;
}

.result-value {
  font-size: 2.5rem;
  font-weight: 700;
  color: #42b883;
}

.info-note {
  font-size: 0.8rem;
  opacity: 0.6;
  padding: 0.8rem;
  background-color: #1a1a1a;
  border-radius: 4px;
}

.info-note p {
  margin: 0.3rem 0;
}

@media (max-width: 768px) {
  .status-grid,
  .operations-grid,
  .composables-grid {
    grid-template-columns: 1fr;
  }

  .count-value {
    font-size: 3rem;
  }

  .result-value {
    font-size: 2rem;
  }
}
</style>
