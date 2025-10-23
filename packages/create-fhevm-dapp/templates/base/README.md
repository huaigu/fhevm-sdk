# {{APP_NAME}}

FHEVM dApp built with {{FRAMEWORK}} and Hardhat.

## Project Structure

```
.
├── packages/
│   ├── frontend/      # {{FRAMEWORK}} application
│   └── hardhat/       # Smart contracts
├── package.json       # Root scripts
└── pnpm-workspace.yaml
```

## Quick Start

### 1. Install Dependencies
```bash
pnpm install
```

### 2. Start Local Blockchain (Terminal 1)
```bash
pnpm chain
```

### 3. Deploy Contracts (Terminal 2)
```bash
pnpm deploy:localhost
```

### 4. Start Frontend (Terminal 3)
```bash
pnpm dev
```

## Available Scripts

**Root level:**
- `pnpm dev` - Start frontend dev server
- `pnpm build` - Build frontend for production
- `pnpm chain` - Start local Hardhat node
- `pnpm compile` - Compile smart contracts
- `pnpm deploy:localhost` - Deploy to local chain
- `pnpm deploy:sepolia` - Deploy to Sepolia testnet
- `pnpm test:contracts` - Run contract tests

**Frontend specific:**
```bash
cd packages/frontend
pnpm dev
pnpm build
```

**Hardhat specific:**
```bash
cd packages/hardhat
pnpm chain
pnpm compile
pnpm test
```

## Environment Variables

Copy `.env.example` to `.env` and fill in:

```
VITE_SEPOLIA_RPC_URL=your_rpc_url
VITE_CONTRACT_ADDRESS=deployed_contract_address
```

## Learn More

- [FHEVM Documentation](https://docs.zama.ai)
- [FHEVM SDK](https://github.com/0xbojack/fhevm-sdk)
