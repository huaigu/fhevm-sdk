import { createApp } from 'vue'
import { createFhevm } from '@0xbojack/fhevm-vue'
import { IndexedDBStorage } from '@0xbojack/fhevm-core'
import './style.css'
import App from './App.vue'

const app = createApp(App)

// Setup FHEVM plugin with IndexedDB storage for persistence
const fhevm = createFhevm({
  config: {
    storage: new IndexedDBStorage(),
  },
})

app.use(fhevm)
app.mount('#app')
