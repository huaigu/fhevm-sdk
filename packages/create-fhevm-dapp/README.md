# create-fhevm-dapp

Scaffold FHEVM dApps with your favorite framework in seconds.

## Quick Start

```bash
npx create-fhevm-dapp
```

## Usage

### Interactive Mode

```bash
npx create-fhevm-dapp
```

The CLI will guide you through:
- Framework selection (Vue, React)
- Project name
- Package manager (pnpm, npm, yarn)
- Dependency installation

### Command Line Mode

```bash
npx create-fhevm-dapp [framework] [name] [options]
```

**Examples:**

```bash
# Create a Vue app
npx create-fhevm-dapp vue my-dapp

# Create a Next.js app
npx create-fhevm-dapp nextjs my-dapp

# Create a React app
npx create-fhevm-dapp react my-dapp

# Skip dependency installation
npx create-fhevm-dapp vue my-dapp --skip-install

# Use specific package manager
npx create-fhevm-dapp nextjs my-dapp --package-manager npm

# Force overwrite existing directory
npx create-fhevm-dapp nextjs my-dapp --force
```

## Options

| Flag | Alias | Description | Default |
|------|-------|-------------|---------|
| `--framework <type>` | `-f` | Framework choice (vue\|nextjs\|react) | Interactive prompt |
| `--name <name>` | `-n` | App name | Interactive prompt |
| `--skip-install` | `-s` | Skip dependency installation | `false` |
| `--package-manager <pm>` | `-p` | Package manager (pnpm\|npm\|yarn) | Auto-detect |
| `--force` | - | Overwrite existing directory | `false` |
| `--help` | `-h` | Show help message | - |
| `--version` | `-v` | Show version | - |

## Supported Frameworks

| Framework | Status | Package |
|-----------|--------|---------|
| Vue 3 | ✅ Available | `@0xbojack/fhevm-vue` |
| Next.js | ✅ Available | `@0xbojack/fhevm-nextjs` |
| React | ✅ Available | `@0xbojack/fhevm-react` |

## What's Included

Each generated dApp includes:

### Frontend
- ✅ Framework-specific setup (Vue/Next.js/React)
- ✅ FHEVM SDK integration
- ✅ Example components
- ✅ TypeScript configuration
- ✅ Vite or Next.js build setup

### Smart Contracts
- ✅ FHECounter example contract
- ✅ Hardhat configuration
- ✅ Deploy scripts
- ✅ TypeChain integration

### Development Tools
- ✅ Local Hardhat node setup
- ✅ Contract compilation scripts
- ✅ Deployment scripts (localhost & Sepolia)
- ✅ Environment configuration

## Project Structure

```
my-dapp/
├── contracts/           # FHEVM smart contracts
│   └── FHECounter.sol   # Encrypted counter example
├── deploy/              # Hardhat deploy scripts
│   └── deploy.ts
├── hardhat.config.ts    # Hardhat configuration
├── src/                 # Frontend source
│   ├── App.vue / App.tsx
│   ├── components/
│   └── ...
├── package.json         # Dependencies & scripts
├── .env.example         # Environment variables template
└── README.md
```

## Available Scripts

After generating your dApp, you can run:

```bash
# Start frontend dev server
pnpm dev

# Build frontend for production
pnpm build

# Start local Hardhat node
pnpm chain

# Compile smart contracts
pnpm compile

# Deploy to local chain
pnpm deploy:localhost

# Deploy to Sepolia testnet
pnpm deploy:sepolia
```

## Get Started

### 1. Generate Your dApp

```bash
npx create-fhevm-dapp vue my-dapp
cd my-dapp
```

### 2. Start Development

**Terminal 1: Start Local Chain**
```bash
pnpm chain
```

**Terminal 2: Deploy Contracts**
```bash
pnpm deploy:localhost
```

**Terminal 3: Start Frontend**
```bash
pnpm dev
```

Your dApp is now running at `http://localhost:5173`!

## Example Workflow

```bash
# 1. Create dApp
$ npx create-fhevm-dapp vue my-encrypted-counter
✔ Framework · Vue
✔ App name · my-encrypted-counter
✔ Package manager · pnpm
✔ Install dependencies · Yes

Creating FHEVM dApp...
✔ Template files copied
✔ package.json updated
✔ Dependencies installed

🎉 Success! Created my-encrypted-counter

# 2. Start development
$ cd my-encrypted-counter
$ pnpm chain  # Terminal 1
$ pnpm deploy:localhost  # Terminal 2
$ pnpm dev  # Terminal 3
```

## Smart Contract Example

The generated `FHECounter.sol` demonstrates:

- ✅ **Encrypted State**: Using `euint32` for encrypted counter
- ✅ **Encrypted Operations**: `increment()` and `decrement()` with encrypted inputs
- ✅ **Client Decryption**: `getCount()` returns encrypted value for client-side decryption
- ✅ **On-Chain Decryption**: `requestDecryptCount()` for asynchronous on-chain decryption

## Environment Setup

Copy `.env.example` to `.env` and configure:

```env
# For Sepolia deployment
VITE_SEPOLIA_RPC_URL=your_sepolia_rpc_url
VITE_CONTRACT_ADDRESS=deployed_contract_address
```

## Troubleshooting

### Templates not found

If you see "Template not found", run from the monorepo root:

```bash
pnpm copy-templates
pnpm cli:build
```

### Package manager not found

Make sure you have your chosen package manager installed:

```bash
# pnpm
npm install -g pnpm

# yarn
npm install -g yarn
```

### Port already in use

If port 5173 (frontend) or 8545 (Hardhat) is in use:

```bash
# Kill process on port
npx kill-port 5173
npx kill-port 8545
```

## Learn More

- **FHEVM Documentation**: https://docs.zama.ai
- **FHEVM SDK**: https://github.com/0xbojack/fhevm-sdk
- **Example Apps**: See `/examples` in the SDK repo

## Contributing

Contributions are welcome! Please check the main repository for guidelines.

## License

BSD-3-Clause-Clear

## Support

- **GitHub Issues**: https://github.com/0xbojack/fhevm-sdk/issues
- **Documentation**: https://github.com/0xbojack/fhevm-sdk#readme
