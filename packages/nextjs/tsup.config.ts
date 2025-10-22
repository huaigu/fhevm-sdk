import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  dts: false, // Skip type generation - we re-export from @0xbojack/fhevm-react
  splitting: false,
  sourcemap: true,
  clean: true,
  treeshake: true,
  external: ['react', 'next', 'ethers', '@0xbojack/fhevm-react', '@0xbojack/fhevm-core'],
  banner: {
    js: "'use client'",
  },
})
