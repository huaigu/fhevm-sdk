<script setup lang="ts">
import Header from './components/Header.vue';
import EncryptedCounter from './components/EncryptedCounter.vue';
</script>

<template>
  <div id="app">
    <Header />
    <main>
      <EncryptedCounter />
    </main>
    <footer class="footer">
      <div class="container">
        <p>
          Built with
          <a href="https://vuejs.org" target="_blank" rel="noopener">Vue 3</a>
          +
          <a href="https://github.com/zama-ai/fhevm" target="_blank" rel="noopener">FHEVM</a>
        </p>
        <p class="links">
          <a href="https://github.com/zama-ai/fhevm-hardhat-template" target="_blank" rel="noopener">
            📚 Docs
          </a>
          <span>•</span>
          <a href="https://github.com/zama-ai" target="_blank" rel="noopener">
            🔧 GitHub
          </a>
        </p>
      </div>
    </footer>
  </div>
</template>

<style scoped>
#app {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

main {
  flex: 1;
  padding: 2rem 0;
}

.footer {
  border-top: 1px solid #ffffff20;
  padding: 2rem 0;
  margin-top: 4rem;
  text-align: center;
}

.footer .container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}

.footer p {
  margin: 0.5rem 0;
  opacity: 0.7;
}

.footer a {
  color: #42b883;
  text-decoration: none;
  font-weight: 500;
}

.footer a:hover {
  text-decoration: underline;
}

.footer .links {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
}

.footer .links span {
  opacity: 0.5;
}
</style>
