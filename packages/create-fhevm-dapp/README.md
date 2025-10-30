# create-fhevm-dapp

Scaffold FHEVM dApps with your favorite framework in seconds.

![CLI demo showing non-interactive project creation](https://github.com/huaigu/fhevm-sdk/blob/HEAD/packages/create-fhevm-dapp/assets/create-fhevm-dapp.gif)

## Quick Start

```bash
npx @0xbojack/create-fhevm-dapp
```

## Usage

### Interactive Mode

```bash
npx @0xbojack/create-fhevm-dapp
```

The CLI will guide you through:
- Framework selection (Vue, React)
- Project name
- Package manager (pnpm, npm, yarn)
- Dependency installation

### Command Line Mode

```bash
npx @0xbojack/create-fhevm-dapp [framework] [name] [options]
```

**Examples:**

```bash
# Create a Vue app
npx @0xbojack/create-fhevm-dapp vue my-dapp

# Create a Next.js app
npx @0xbojack/create-fhevm-dapp nextjs my-dapp

# Create a React app
npx @0xbojack/create-fhevm-dapp react my-dapp

# Skip dependency installation
npx @0xbojack/create-fhevm-dapp vue my-dapp --skip-install

# Use specific package manager
npx @0xbojack/create-fhevm-dapp nextjs my-dapp --package-manager npm

# Force overwrite existing directory
npx @0xbojack/create-fhevm-dapp nextjs my-dapp --force
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

Each generated dApp is a pnpm workspace with two packages: a framework-specific frontend and a Hardhat project. Out of the box you get:

- ✅ Hooks/composables wired to the `@fhevm/*` SDKs
- ✅ A Hardhat project with FHECounter contract, deploy scripts, and TypeChain
- ✅ Tailwind/RainbowKit (React + Next) or Vue UI scaffolding
- ✅ Local and Sepolia scripts, including automatic ABI generation

## Project Structure

```
my-dapp/
├── package.json               # Root scripts (pnpm workspace)
├── pnpm-workspace.yaml
└── packages/
    ├── frontend/              # Framework app (Next.js / React / Vue)
    │   ├── contracts/
    │   │   └── deployedContracts.ts  # Auto-generated contract map
    │   ├── components/        # Demo UI + hooks usage
    │   └── ...                # Framework-specific sources and config
    └── hardhat/               # Smart contracts workspace
        ├── contracts/FHECounter.sol
        ├── deploy/deploy.ts
        ├── scripts/generateTsAbis.ts
        └── ...                # Hardhat config, tasks, tests
```

> `packages/frontend/**/contracts/deployedContracts.ts` is regenerated automatically after every deploy. Run `pnpm generate:abis` if you need to refresh it manually.

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

# Deploy to Sepolia testnet (updates ABI map on success)
pnpm deploy:sepolia

# Regenerate contract map without redeploying
pnpm generate:abis
```

## Get Started

### 1. Generate Your dApp

```bash
npx @0xbojack/create-fhevm-dapp vue my-dapp
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
This step also refreshes the frontend ABI map. To regenerate manually later run `pnpm generate:abis`.

**Terminal 3: Start Frontend**
```bash
pnpm dev
```

Your dApp is now running at `http://localhost:5173`!

## Example Workflow

```bash
# 1. Create dApp
$ npx @0xbojack/create-fhevm-dapp vue my-encrypted-counter
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
$ pnpm deploy:localhost  # Terminal 2 (refreshes ABI map)
$ pnpm generate:abis     # Optional: regenerate ABI map manually
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
