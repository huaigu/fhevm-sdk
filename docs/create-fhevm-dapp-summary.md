# create-fhevm-dapp - Quick Reference

## Overview

CLI tool for scaffolding complete FHEVM dApps with frontend + smart contracts in a single command.

**Command**: `npx create-fhevm-dapp [vue|react] [app-name]`

## Current Status

| Framework | Status | Example Source |
|-----------|--------|----------------|
| Vue | ✅ Ready | `examples/vue-app/` |
| React | ⏳ Waiting | Needs example creation |
| Next.js | 🔮 Future | Separate from React |

## What Gets Generated

```
my-dapp/
├── contracts/           # FHEVM smart contracts
│   └── FHECounter.sol   # Encrypted counter example
├── deploy/              # Hardhat deploy scripts
│   └── deploy.ts
├── hardhat.config.ts    # Hardhat configuration
├── src/                 # Frontend source (Vue/React)
│   ├── App.vue / App.tsx
│   ├── components/
│   └── ...
├── package.json         # Merged deps & scripts
├── .env.example
└── README.md
```

## Template Sources

### Frontend
- **Vue**: `examples/vue-app/` → `templates/vue/src/`
- **React**: `examples/react-app/` → `templates/react/src/` (when ready)

### Contracts (All Templates)
- **Contracts**: `packages/hardhat/contracts/` → `templates/{framework}/contracts/`
- **Deploy**: `packages/hardhat/deploy/` → `templates/{framework}/deploy/`
- **Config**: `packages/hardhat/hardhat.config.ts` → `templates/{framework}/`

### Scripts Merging
- **Frontend scripts**: From `examples/{framework}/package.json`
- **Contract scripts**: From root `package.json`
- **Result**: Merged into single `package.json`

## Package.json Merging Example

### Before (Separate)

**examples/vue-app/package.json**:
```json
{
  "scripts": {
    "dev": "vite",
    "build": "vue-tsc && vite build"
  },
  "dependencies": {
    "@0xbojack/fhevm-vue": "workspace:*",
    "vue": "^3.5.13"
  }
}
```

**Root package.json** (contract scripts):
```json
{
  "scripts": {
    "chain": "pnpm hardhat:chain",
    "compile": "pnpm hardhat:compile",
    "deploy:localhost": "pnpm hardhat:deploy"
  }
}
```

### After (Merged in Template)

**Generated package.json**:
```json
{
  "name": "my-dapp",
  "scripts": {
    "dev": "vite",
    "build": "vue-tsc && vite build",
    "chain": "hardhat node --network hardhat --no-deploy",
    "compile": "hardhat compile",
    "deploy:localhost": "hardhat deploy --network localhost",
    "deploy:sepolia": "hardhat deploy --network sepolia"
  },
  "dependencies": {
    "@0xbojack/fhevm-vue": "^0.4.0",
    "vue": "^3.5.13",
    "ethers": "^6.13.4"
  },
  "devDependencies": {
    "hardhat": "^2.26.0",
    "hardhat-deploy": "^0.11.45",
    "@fhevm/hardhat-plugin": "^0.1.0",
    "@fhevm/solidity": "^0.8.0",
    "@vitejs/plugin-vue": "^5.2.1",
    "vite": "^6.0.5"
  }
}
```

## User Workflow

### 1. Generate
```bash
npx create-fhevm-dapp vue my-dapp
cd my-dapp
```

### 2. Start Chain (Terminal 1)
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

### Result
- ✅ Local Hardhat chain running
- ✅ FHECounter contract deployed
- ✅ Frontend connected at http://localhost:5173
- ✅ Ready to build FHEVM dApp

## Implementation Steps

### Phase 1: Setup (0.5 day)
- [ ] Create `packages/create-fhevm-dapp/` directory
- [ ] Configure package.json with bin entry
- [ ] Setup tsup for ESM build
- [ ] Add shebang to entry point

### Phase 2: Core Logic (2 days)
- [ ] CLI argument parsing (Commander)
- [ ] Interactive prompts (Prompts library)
- [ ] Template registry
- [ ] Input validation

### Phase 3: Template Copying (2.5 days)
- [ ] Copy frontend from examples/
- [ ] Copy contracts from packages/hardhat/
- [ ] Merge package.json logic
- [ ] Template variable replacement
- [ ] File filtering (exclude build artifacts)

### Phase 4: Testing (1.5 days)
- [ ] Unit tests for validators
- [ ] Unit tests for merging logic
- [ ] Integration tests (full generation)
- [ ] Manual QA with different options

### Phase 5: Documentation (1 day)
- [ ] CLI README
- [ ] Template README generation
- [ ] Usage examples
- [ ] Troubleshooting guide

### Phase 6: Publishing (0.5 day)
- [ ] NPM package setup
- [ ] Test npx installation
- [ ] Publish to registry

**Total**: ~6-8 days

## Dependencies

### Runtime
```json
{
  "commander": "^12.0.0",
  "prompts": "^2.4.2",
  "chalk": "^5.3.0",
  "ora": "^8.0.1",
  "fs-extra": "^11.2.0",
  "validate-npm-package-name": "^6.0.0"
}
```

### Dev
```json
{
  "@types/node": "^22.7.5",
  "@types/prompts": "^2.4.9",
  "@types/fs-extra": "^11.0.4",
  "typescript": "^5.9.2",
  "tsup": "^8.5.0"
}
```

## Build Scripts

### Root package.json
```json
{
  "scripts": {
    "copy-templates": "ts-node scripts/copy-templates.ts",
    "build:cli": "pnpm --filter create-fhevm-dapp build"
  }
}
```

### create-fhevm-dapp/package.json
```json
{
  "scripts": {
    "build": "tsup src/index.ts --format esm --dts --clean",
    "prepublishOnly": "pnpm copy-templates && pnpm build"
  }
}
```

## Key Design Decisions

### 1. Self-Contained Templates
**Why**: Users can use generated dApp outside monorepo
- No workspace dependencies
- Can be published to separate repo
- Standard dApp structure

### 2. Build-Time Template Copying
**Why**: Smaller package size, faster installation
- Templates copied during build
- Not copied at runtime
- Reduces package dependencies

### 3. Package.json Merging
**Why**: Single source of truth for scripts
- Frontend scripts from examples
- Contract scripts from root
- No manual maintenance needed

### 4. FHECounter Example
**Why**: Shows core FHEVM features
- Encrypted state management
- Client-side encryption
- On-chain decryption
- Event emission

## Testing Strategy

### Unit Tests
```typescript
describe('mergePackageJson', () => {
  it('should merge scripts correctly', () => {
    const frontend = { scripts: { dev: 'vite' } }
    const contracts = { scripts: { chain: 'hardhat node' } }
    const result = mergePackageJson(frontend, contracts)
    expect(result.scripts.dev).toBe('vite')
    expect(result.scripts.chain).toBe('hardhat node')
  })
})
```

### Integration Tests
```bash
# Generate Vue app
$ create-fhevm-dapp vue test-app

# Verify structure
$ ls test-app/
contracts/ deploy/ src/ hardhat.config.ts package.json

# Verify scripts work
$ cd test-app
$ pnpm install
$ pnpm compile  # Should compile contracts
$ pnpm build    # Should build frontend
```

## Success Criteria

- ✅ Single command generates complete dApp
- ✅ Frontend + Contracts work together
- ✅ No manual configuration needed
- ✅ Time to first working dApp: <5 minutes
- ✅ Generated dApp can be published separately
- ✅ Contract deployment works on localhost & sepolia

## Future Enhancements

### Phase 2
- [ ] React template (when example ready)
- [ ] Next.js template (when example ready)
- [ ] TypeScript/JavaScript choice
- [ ] Git initialization

### Phase 3
- [ ] Multiple contract templates:
  - Counter (default)
  - ERC20
  - Voting
  - Auction
- [ ] Contract selection prompt
- [ ] Custom contract generation

### Phase 4
- [ ] CI/CD templates (GitHub Actions)
- [ ] Docker support
- [ ] Testing templates
- [ ] Deployment scripts for production

## Resources

- **Main Design Doc**: `docs/create-fhevm-dapp-plan.md`
- **FHEVM Docs**: https://docs.zama.ai
- **Hardhat Docs**: https://hardhat.org
- **Similar Tools**:
  - create-next-app
  - create-vite
  - create-react-app
