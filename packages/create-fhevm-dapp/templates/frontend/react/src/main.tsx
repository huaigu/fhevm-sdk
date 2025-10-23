import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { AppProviders } from './components/providers/AppProviders'
import { App } from './App'
import './index.css'
import '@rainbow-me/rainbowkit/styles.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppProviders>
      <App />
    </AppProviders>
  </StrictMode>,
)
