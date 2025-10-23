# {{APP_NAME}}

{{DESCRIPTION}}

## Quick Start

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Start Local Chain

```bash
pnpm chain
```

### 3. Deploy Contracts (new terminal)

```bash
pnpm deploy:localhost
```

### 4. Start Frontend (new terminal)

```bash
pnpm dev
```

## Project Structure

```
├── contracts/        # FHEVM smart contracts
├── deploy/           # Hardhat deploy scripts
├── src/              # Frontend source
├── hardhat.config.ts # Hardhat configuration
└── package.json
```

## Available Scripts

- `pnpm dev` - Start frontend dev server
- `pnpm build` - Build frontend for production
- `pnpm chain` - Start local Hardhat node
- `pnpm compile` - Compile smart contracts
- `pnpm deploy:localhost` - Deploy to local chain
- `pnpm deploy:sepolia` - Deploy to Sepolia testnet

## Smart Contracts

### FHECounter

Encrypted counter demonstrating FHEVM capabilities.

**Functions:**
- `increment(encryptedValue, proof)` - Add encrypted value
- `decrement(encryptedValue, proof)` - Subtract encrypted value
- `getCount()` - Get encrypted count (requires client decryption)
- `requestDecryptCount()` - Request on-chain decryption

## Environment Variables

Copy `.env.example` to `.env` and fill in:

```
VITE_SEPOLIA_RPC_URL=your_rpc_url
VITE_CONTRACT_ADDRESS=deployed_contract_address
```

## Learn More

- [FHEVM Documentation](https://docs.zama.ai)
- [FHEVM SDK](https://github.com/0xbojack/fhevm-sdk)
