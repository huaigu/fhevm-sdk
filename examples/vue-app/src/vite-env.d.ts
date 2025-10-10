/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_DEFAULT_CHAIN_ID?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

declare global {
  interface Window {
    ethereum?: any
  }
}

export {}
