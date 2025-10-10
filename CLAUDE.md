# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 🏆 Bounty Context

**Mission**: Build the next-generation **FHEVM Universal SDK** for Zama's Bounty Program (October 2025)

**Prize Pool**: $10,000

**Timeline**:
- Start: October 8, 2025
- Deadline: October 31, 2025 (23:59 AoE)
- **Days Remaining**: Calculate from current date

**Challenge**: Create a framework-agnostic frontend toolkit that makes building confidential dApps simple, consistent, and developer-friendly.

### Judging Criteria (Priority Order)
1. **Usability** (40%): Quick setup, minimal boilerplate, <10 lines to get started
2. **Completeness** (30%): Full FHEVM flow (init, encrypt, decrypt, contract interaction)
3. **Reusability** (20%): Clean, modular, framework-adaptable components
4. **Documentation** (10%): Clear examples, straightforward onboarding
5. **Creativity** (Bonus): Multi-environment showcase, innovative use cases

### Key Requirements
- ✅ **Framework-agnostic core** (works in Node.js, Next.js, Vue, React)
- ✅ **Wagmi-like structure** (intuitive for web3 developers)
- ✅ **Wrapper around all dependencies** (no scattered imports)
- ✅ **Next.js showcase** (REQUIRED)
- 🎁 **Vue showcase** (BONUS)
- 🎁 **Multiple environments** (BONUS)

### Deliverables Checklist
- [ ] GitHub repo (forked from fhevm-react-template with preserved history)
- [ ] Universal SDK package (fhevm-sdk)
- [ ] Next.js template/example (REQUIRED)
- [ ] Vue template/example (BONUS)
- [ ] 3-5 min video walkthrough
- [ ] Deployment link(s) in README
- [ ] NPM package publication (optional but recommended)

## 📐 Project Architecture (PRD Design)

### Repository Structure (Monorepo)
```
fhevm-sdk/
├── packages/
│   ├── contracts/              # Smart contracts (EncryptedCounter.sol)
│   ├── core/                   # @fhevm/core - Framework-agnostic SDK
│   ├── react/                  # @fhevm/react - React hooks/adapters
│   ├── vue/                    # @fhevm/vue - Vue composables (BONUS)
│   └── fhevm-sdk/              # Main aggregator package
├── examples/
│   ├── nextjs-app/             # Next.js showcase (REQUIRED)
│   └── vue-app/                # Vue showcase (BONUS)
├── docs/
│   ├── prd.md                  # Product Requirements Document
│   └── bountry.md              # Bounty requirements
└── scripts/                    # Build & deployment automation
```

### Package Design

**1. @fhevm/core (Framework-Agnostic Foundation)**
```typescript
// 100% framework-independent, no React/Vue dependencies
export class FhevmClient {
  init(config: FhevmConfig): Promise<void>
  encrypt(data: EncryptInput): Promise<EncryptedData>
  decrypt(handles: DecryptRequest[]): Promise<DecryptResult>
  // All low-level fhevmjs interactions
}
```

**2. @fhevm/react (React Adapter - Wagmi-like)**
```typescript
// Wagmi-inspired hooks for React developers
export function useFhevm(config): FhevmInstance
export function useEncrypt(params): { encrypt, isEncrypting }
export function useDecrypt(params): { decrypt, isDecrypting, results }
export function useFhevmContract(address, abi): ContractHelpers
```

**3. @fhevm/vue (Vue Adapter - BONUS)**
```typescript
// Vue composables following Vue 3 patterns
export function createFhevm(config): Plugin
export function useEncrypt(params): ComputedRef<EncryptState>
export function useDecrypt(params): ComputedRef<DecryptState>
```

**4. fhevm-sdk (Main Package - Aggregator)**
```typescript
// Convenience package exporting everything
export * from '@fhevm/core'
export * from '@fhevm/react'
// Potential future: export * from '@fhevm/vue'
```

### Wagmi-like API Design Principles

**Comparison with Wagmi:**
```typescript
// Wagmi pattern
import { useAccount, useContract, useContractRead } from 'wagmi'

// Our FHEVM SDK pattern (target)
import { useFhevm, useFhevmContract, useEncrypt, useDecrypt } from 'fhevm-sdk/react'

// Both follow:
// - Hook-based API
// - Composable utilities
// - TypeScript-first
// - Minimal boilerplate
```

**Naming Conventions:**
- Hooks: `use[Feature]` (e.g., `useEncrypt`, `useDecrypt`, `useFhevm`)
- Types: `[Feature]Config`, `[Feature]Result` (e.g., `EncryptConfig`, `DecryptResult`)
- Methods: Verb-first (e.g., `encrypt()`, `decrypt()`, `createInstance()`)

## 🔧 Essential Commands

### Initial Setup
```bash
# Clone and initialize (CRITICAL: Must be a fork!)
git clone <your-fork-url>
cd fhevm-sdk
pnpm install

# Verify submodule initialization
git submodule update --init --recursive
```

### Development Commands (Root-Level Operations)

**Build & Test**
```bash
# Build all packages
pnpm build

# Run all tests
pnpm test

# Watch mode for tests
pnpm test:watch
```

**Contract Operations**
```bash
# Compile contracts
pnpm contract:compile

# Deploy contracts (local)
pnpm contract:deploy

# Deploy to Sepolia
pnpm contract:deploy:sepolia
```

**Development Servers**
```bash
# Next.js example (REQUIRED)
pnpm dev:react

# Vue example (BONUS)
pnpm dev:vue
```

**Package Management**
```bash
# Build all SDK packages
pnpm --filter "./packages/*" build

# Test specific package
pnpm --filter @fhevm/core test

# Publish with Changesets
pnpm release
```

### Existing SDK Commands (Reference)
These commands are from the current template and should be preserved/adapted:

```bash
# SDK development
pnpm sdk:build
pnpm sdk:watch
pnpm sdk:test

# Hardhat operations
pnpm chain                  # Start local node
pnpm deploy:localhost       # Deploy + generate ABIs
pnpm deploy:sepolia

# Next.js operations
pnpm start                  # Start frontend
pnpm next:build
```

## 🏗️ Current Implementation Analysis

### Existing Assets (Reusable Components)

**✅ Core FHEVM Logic** (`packages/fhevm-sdk/src/internal/`)
- `fhevm.ts:createFhevmInstance`: Mock vs live chain detection, instance creation
- `RelayerSDKLoader.ts`: CDN loading for Zama Relayer SDK
- `PublicKeyStorage.ts`: Public key caching with IndexedDB
- `FhevmDecryptionSignature.ts`: EIP-712 signature management (365-day cache)

**✅ React Hooks** (`packages/fhevm-sdk/src/react/`)
- `useFhevm.tsx`: Instance creation with abort controller cleanup
- `useFHEEncryption.ts`: Encryption utilities with `encryptWith` builder pattern
- `useFHEDecrypt.ts`: Decryption with signature management
- `useInMemoryStorage.tsx`: Ephemeral storage for development

**✅ Storage Abstractions** (`packages/fhevm-sdk/src/storage/`)
- `GenericStringStorage.ts`: Interface for key-value storage
- IndexedDB implementation for browser persistence

**✅ Type Definitions** (`packages/fhevm-sdk/src/fhevmTypes.ts`)
- `FhevmInstance`, `FhevmInstanceConfig`, `EIP712Type`, etc.

### Architecture Strengths (Keep)
1. **Mock chain detection**: Automatically detects Hardhat (chainId 31337) and loads mock utilities
2. **Dynamic imports**: Prevents `@fhevm/mock-utils` from bloating production bundles
3. **Decryption signature caching**: 365-day EIP-712 signatures stored in IndexedDB
4. **Builder pattern**: `encryptWith(builder => builder.encrypt32(42))` is clean and intuitive

### Architecture Gaps (Address in Refactor)
1. **Not framework-agnostic**: Current code tightly couples React (hooks, useState, useEffect)
2. **Not wagmi-like**: Naming and patterns differ from wagmi conventions
3. **No aggregator package**: Users must import from `@fhevm-sdk` workspace package
4. **Missing Vue support**: No Vue 3 composables or plugin
5. **Limited documentation**: Needs comprehensive API docs and usage examples

## 🎯 Development Roadmap (PRD Phases)

### Phase 0: Infrastructure Setup ⏱️ 1-2 days
**Status**: 🟡 Partially Complete (monorepo exists, needs restructure)

- [x] Fork fhevm-react-template (DONE - this repo)
- [ ] Clean repo structure (remove unnecessary template files)
- [ ] Initialize new pnpm workspace structure
  - [ ] Create `packages/contracts/`
  - [ ] Create `packages/core/`
  - [ ] Create `packages/react/`
  - [ ] Create `packages/vue/` (BONUS)
  - [ ] Create `packages/fhevm-sdk/`
  - [ ] Create `examples/nextjs-app/`
  - [ ] Create `examples/vue-app/` (BONUS)
- [ ] Setup build tooling
  - [ ] Configure Tsup for library bundling
  - [ ] Configure Vitest for testing
  - [ ] Setup Changesets for versioning
- [ ] Develop EncryptedCounter.sol contract
- [ ] Write Hardhat deployment scripts

**Key Files**:
- `pnpm-workspace.yaml`: Define workspace packages
- `package.json` (root): Root-level scripts for all operations
- `tsconfig.base.json`: Shared TypeScript config

### Phase 1: Core SDK (@fhevm/core) ⏱️ 4-5 days
**Status**: 🟢 Foundation Exists (refactor needed for framework-agnostic)

**Refactoring Strategy**:
1. **Extract from existing SDK**: Move framework-independent code from `packages/fhevm-sdk/src/internal/` to `packages/core/src/`
2. **Create FhevmClient class**: Wrap existing utilities in a clean API
3. **Remove React dependencies**: Replace hooks with promise-based methods
4. **Preserve mock detection**: Keep `createFhevmInstance` logic

**Implementation Tasks**:
- [ ] Create `packages/core/src/FhevmClient.ts`
  - [ ] `init()`: Initialize FHEVM instance (mock or live)
  - [ ] `encrypt()`: Encrypt data with type inference
  - [ ] `decrypt()`: Decrypt handles with signature management
  - [ ] `getPublicKey()`: Retrieve cached public key
- [ ] Port utilities (framework-agnostic versions)
  - [ ] `createFhevmInstance` (from `internal/fhevm.ts`)
  - [ ] `RelayerSDKLoader` (no changes needed)
  - [ ] `PublicKeyStorage` (adapter for different storage backends)
  - [ ] `FhevmDecryptionSignature` (minimal changes)
- [ ] Write comprehensive Vitest tests
  - [ ] Mock chain initialization tests
  - [ ] Encryption/decryption flow tests
  - [ ] Public key caching tests
  - [ ] EIP-712 signature tests
- [ ] Document core API with JSDoc
- [ ] Create `packages/core/README.md`

**API Example** (Target):
```typescript
import { FhevmClient } from '@fhevm/core'

const client = new FhevmClient()
await client.init({ provider, chainId })

const encrypted = await client.encrypt({ value: 42, type: 'euint32' })
const result = await client.decrypt([{ handle, contractAddress }], signer)
```

### Phase 2: React Ecosystem (@fhevm/react + fhevm-sdk) ⏱️ 5 days
**Status**: 🟢 Exists (needs wagmi-like refactor)

**Refactoring Strategy**:
1. **Wrap @fhevm/core**: React hooks should be thin wrappers around FhevmClient
2. **Adopt wagmi conventions**: Rename hooks to match wagmi patterns
3. **Provider pattern**: Create `<FhevmProvider>` for context (like wagmi's `<WagmiConfig>`)
4. **Composability**: Each hook should be independently usable

**Implementation Tasks**:
- [ ] Create `packages/react/src/FhevmProvider.tsx`
  - [ ] Context provider for FhevmClient instance
  - [ ] Configuration management
  - [ ] Global state for instance lifecycle
- [ ] Refactor hooks (wagmi-like API)
  - [ ] `useFhevm()`: Access FHEVM instance from context
  - [ ] `useEncrypt()`: Encryption with loading states
  - [ ] `useDecrypt()`: Decryption with caching
  - [ ] `useFhevmContract()`: Contract interaction helpers
- [ ] Create aggregator package `fhevm-sdk`
  - [ ] Re-export @fhevm/core
  - [ ] Re-export @fhevm/react
  - [ ] Convenience exports
- [ ] Build Next.js showcase app (`examples/nextjs-app/`)
  - [ ] Setup with RainbowKit + Wagmi
  - [ ] EncryptedCounter demo
  - [ ] Full encrypt → deploy → read → decrypt flow
  - [ ] Responsive UI with TailwindCSS
- [ ] Write React hook tests with Vitest + React Testing Library
- [ ] Document React API with examples

**Wagmi-like Hook API** (Target):
```typescript
// Before (current)
import { useFhevm, useFHEEncryption, useFHEDecrypt } from '@fhevm-sdk/react'

// After (wagmi-like)
import { useFhevm, useEncrypt, useDecrypt } from 'fhevm-sdk/react'

function MyComponent() {
  const { instance, status } = useFhevm()
  const { encrypt, isEncrypting } = useEncrypt({ instance, contract })
  const { decrypt, results } = useDecrypt({ instance, handles })

  // Clean, composable, wagmi-familiar
}
```

### Phase 3: Vue Ecosystem (@fhevm/vue) ⏱️ 3-4 days (BONUS)
**Status**: 🔴 Not Started

**Implementation Tasks**:
- [ ] Create `packages/vue/src/plugin.ts`
  - [ ] `createFhevm()`: Vue plugin factory
  - [ ] Global configuration injection
- [ ] Create Vue composables
  - [ ] `useFhevm()`: Access FHEVM instance (inject pattern)
  - [ ] `useEncrypt()`: Reactive encryption state
  - [ ] `useDecrypt()`: Reactive decryption state
- [ ] Build Vue showcase app (`examples/vue-app/`)
  - [ ] Setup with Vite + Vue 3
  - [ ] Same EncryptedCounter demo
  - [ ] Composition API throughout
- [ ] Write composable tests with Vitest
- [ ] Document Vue API with examples

**Vue Composables API** (Target):
```typescript
// Vue 3 Composition API pattern
import { createFhevm } from '@fhevm/vue'
import { useFhevm, useEncrypt, useDecrypt } from '@fhevm/vue'

// Plugin registration
app.use(createFhevm({ /* config */ }))

// In components
const { instance, status } = useFhevm()
const { encrypt, isEncrypting } = useEncrypt({ instance, contract })
const { decrypt, results } = useDecrypt({ instance, handles })
```

### Phase 4: Documentation & Deployment ⏱️ 4-5 days
**Status**: 🔴 Not Started

**Documentation Tasks**:
- [ ] Root `README.md`
  - [ ] Project overview with architecture diagram
  - [ ] Quick start (<10 lines of code)
  - [ ] Links to all packages and examples
  - [ ] Deployment links
  - [ ] Video walkthrough embed
- [ ] Package READMEs
  - [ ] `packages/core/README.md`: Core API reference
  - [ ] `packages/react/README.md`: React hooks guide
  - [ ] `packages/vue/README.md`: Vue composables guide (BONUS)
  - [ ] `packages/fhevm-sdk/README.md`: Main entry point docs
- [ ] Example READMEs
  - [ ] `examples/nextjs-app/README.md`: Next.js setup
  - [ ] `examples/vue-app/README.md`: Vue setup (BONUS)
- [ ] Code documentation
  - [ ] JSDoc comments for all public APIs
  - [ ] TypeScript type annotations
  - [ ] Inline code examples

**Deployment Tasks**:
- [ ] Deploy Next.js app to Vercel
  - [ ] Configure environment variables
  - [ ] Test on Sepolia testnet
  - [ ] Add deployment link to README
- [ ] Deploy Vue app to Netlify (BONUS)
  - [ ] Configure build settings
  - [ ] Test deployment
  - [ ] Add link to README
- [ ] NPM Package Publishing (OPTIONAL)
  - [ ] Setup NPM organization (e.g., @fhevm)
  - [ ] Configure Changesets
  - [ ] Publish @fhevm/core, @fhevm/react, @fhevm/vue, fhevm-sdk
  - [ ] Add NPM badges to README

**Video Walkthrough** (3-5 minutes):
- [ ] Script outline
  - [ ] Problem: Current FHEVM frontend challenges
  - [ ] Solution: Universal SDK architecture
  - [ ] Demo: Install → Configure → Encrypt → Decrypt
  - [ ] Multi-framework showcase (React + Vue)
- [ ] Record screen capture
  - [ ] Show package installation
  - [ ] Walk through code examples
  - [ ] Demo live Next.js app
  - [ ] Demo Vue app (BONUS)
- [ ] Edit and upload (YouTube/Loom)
- [ ] Add embed link to README

### Phase 5: Final Submission ⏱️ October 31, 2025
**Status**: 🔴 Not Started

**Pre-Submission Checklist**:
- [ ] Code quality
  - [ ] All tests passing (`pnpm test`)
  - [ ] No TypeScript errors (`pnpm check-types`)
  - [ ] Linting clean (`pnpm lint`)
  - [ ] Code formatted (`pnpm format`)
- [ ] Documentation complete
  - [ ] All READMEs written
  - [ ] JSDoc comments complete
  - [ ] Video published and linked
- [ ] Deployments live
  - [ ] Next.js app accessible
  - [ ] Vue app accessible (BONUS)
  - [ ] Links tested and working
- [ ] Repository clean
  - [ ] Remove debug code
  - [ ] Update .gitignore
  - [ ] Verify commit history preserved (fork requirement)
- [ ] Final review
  - [ ] Test installation from scratch
  - [ ] Verify <10 lines to get started
  - [ ] Check all deliverables against bounty requirements

**Submission**:
- [ ] Submit GitHub repo link to Zama bounty program
- [ ] Include video link in submission
- [ ] Confirm all deployment links work
- [ ] Submit before October 31, 2025 23:59 AoE

## 🛠️ Development Patterns

### Framework-Agnostic Core Pattern

**❌ BAD - Framework-dependent:**
```typescript
// Don't do this in @fhevm/core
export function useEncrypt() {
  const [isEncrypting, setIsEncrypting] = useState(false) // React dependency!
  // ...
}
```

**✅ GOOD - Framework-agnostic:**
```typescript
// @fhevm/core should use plain promises
export class FhevmClient {
  async encrypt(params: EncryptParams): Promise<EncryptResult> {
    // Pure business logic, no framework hooks
    return await this.instance.encrypt(params)
  }
}
```

### Wagmi-like Hook Pattern

**Consistency with wagmi:**
```typescript
// Wagmi pattern
const { data, error, isLoading } = useContractRead({
  address: '0x...',
  abi: ABI,
  functionName: 'balanceOf'
})

// Our pattern (match naming)
const { data, error, isEncrypting } = useEncrypt({
  instance,
  value: 42,
  type: 'euint32'
})
```

**Key principles:**
- Return object with named properties (not array)
- Use `is[Action]ing` for loading states
- Include `error` for error handling
- Provide `data` or specific result property

### Encryption Method Mapping

**Pattern** (from existing SDK - preserve):
```typescript
// Map Solidity internal types to SDK methods
const getEncryptionMethod = (internalType: string) => {
  switch (internalType) {
    case 'externalEuint8': return 'add8'
    case 'externalEuint16': return 'add16'
    case 'externalEuint32': return 'add32'
    case 'externalEuint64': return 'add64'
    case 'externalEuint128': return 'add128'
    case 'externalEuint256': return 'add256'
    case 'externalEbool': return 'addBool'
    case 'externalEaddress': return 'addAddress'
    default: return 'add64'
  }
}
```

**Usage**:
```typescript
// Builder pattern (preserve this - it's excellent)
const enc = await encryptWith(builder => {
  builder.encrypt32(42)      // for euint32
  builder.encryptBool(true)  // for ebool
})
```

### Decryption Signature Management

**Pattern** (from existing SDK - preserve):
```typescript
// EIP-712 signature cached for 365 days
const sig = await FhevmDecryptionSignature.loadOrSign(
  instance,
  contractAddresses,
  signer,
  storage
)

// Reuse cached signature if valid, otherwise prompt user to sign
const results = await instance.userDecrypt(
  requests,
  sig.privateKey,
  sig.publicKey,
  sig.signature,
  // ... other params
)
```

**Key insight**: Only prompt user to sign once per year per contract set!

### Mock vs Live Chain Detection

**Pattern** (from existing SDK - preserve):
```typescript
// Automatic detection based on chainId and RPC metadata
const { isMock, rpcUrl, chainId } = await resolve(provider, mockChains)

if (isMock) {
  // Dynamic import to avoid production bundle bloat
  const fhevmMock = await import('./mock/fhevmMock')
  return await fhevmMock.createInstance({ rpcUrl, chainId, metadata })
}

// For live networks, load Relayer SDK from CDN
await loadRelayerSDK()
return await relayerSDK.createInstance(config)
```

**CRITICAL**: Always use dynamic imports for mock utilities!

## 📚 Testing Strategy

### Unit Tests (Vitest)
```bash
# Run all tests
pnpm test

# Watch mode
pnpm test:watch

# Coverage
pnpm test:coverage
```

**Test Coverage Requirements**:
- @fhevm/core: >90% coverage
- @fhevm/react: >80% coverage
- @fhevm/vue: >80% coverage (BONUS)

**Key Test Areas**:
- Instance creation (mock vs live)
- Encryption/decryption flows
- Public key caching
- EIP-712 signature lifecycle
- Error handling and edge cases

### Integration Tests
- Full encrypt → deploy → decrypt flow
- Multi-contract decryption
- Signature reuse across contracts
- Network switching scenarios

### Example App Testing
- Manual QA of Next.js showcase
- Manual QA of Vue showcase (BONUS)
- Cross-browser testing
- Mobile responsiveness

## 🚨 Common Pitfalls & Solutions

### 1. Framework Coupling in Core
**Problem**: Adding React hooks to @fhevm/core
**Solution**: Keep core 100% framework-agnostic, use plain promises

### 2. Bundle Bloat with Mock Utilities
**Problem**: Including @fhevm/mock-utils in production builds
**Solution**: Always use dynamic imports: `await import('./mock/fhevmMock')`

### 3. Inconsistent API Naming
**Problem**: Mixing naming conventions (camelCase, PascalCase, kebab-case)
**Solution**: Follow wagmi conventions strictly:
- Hooks: `use[Feature]`
- Types: `[Feature]Config`, `[Feature]Result`
- Methods: verb-first (encrypt, decrypt, init)

### 4. Missing Signature Caching
**Problem**: Prompting user to sign EIP-712 message on every decrypt
**Solution**: Use FhevmDecryptionSignature.loadOrSign() with 365-day validity

### 5. Hardhat Nonce Mismatch
**Problem**: MetaMask nonce errors after restarting Hardhat
**Solution**:
1. MetaMask: Settings → Advanced → Clear Activity Tab
2. Restart browser (clears view function cache)
3. Redeploy contracts

## 🎥 Video Walkthrough Script

**Duration**: 3-5 minutes

**Structure**:
1. **Introduction** (30s)
   - The problem: FHEVM frontend complexity
   - The solution: Universal SDK with wagmi-like API

2. **Architecture Overview** (1m)
   - Show monorepo structure
   - Explain core → adapters → aggregator pattern
   - Highlight framework-agnostic design

3. **Quick Start Demo** (2m)
   - Install: `pnpm add fhevm-sdk`
   - Setup: Show <10 lines of code
   - Run: Encrypt → Deploy → Decrypt demo

4. **Multi-Framework Showcase** (1m)
   - Next.js example walkthrough
   - Vue example walkthrough (BONUS)
   - Highlight API consistency

5. **Closing** (30s)
   - GitHub repo link
   - Deployment links
   - Call to action: Try it yourself!

**Recording Tips**:
- Use clean, high-contrast terminal theme
- Increase font size (18-20pt minimum)
- Record in 1080p or higher
- Add chapter markers in video description

## 🔗 Important Links

**Bounty Program**:
- Zama Bounty Page: [Add link when available]
- Submission Form: [Add link]

**Documentation**:
- FHEVM Docs: https://docs.zama.ai/protocol/solidity-guides/
- Relayer SDK: https://docs.zama.ai/protocol/relayer-sdk-guides/
- Wagmi Docs: https://wagmi.sh/react/getting-started (for API inspiration)

**Development**:
- Original Template: https://github.com/zama-ai/fhevm-react-template
- This Fork: [Your GitHub URL]
- Next.js Deployment: [Vercel URL]
- Vue Deployment: [Netlify URL] (BONUS)

**Community**:
- Zama Discord: https://discord.com/invite/zama
- GitHub Issues: [Repository issues URL]

## 📝 Notes for Claude Code

**When implementing Phase X**:
1. Review this CLAUDE.md before starting
2. Check existing code in `packages/fhevm-sdk/src/` for reusable patterns
3. Follow wagmi-like conventions strictly
4. Keep core framework-agnostic
5. Write tests alongside implementation
6. Update TODO list as tasks complete

**When stuck**:
1. Review bounty requirements in `docs/bountry.md`
2. Check PRD design in `docs/prd.md`
3. Reference existing SDK implementation in `packages/fhevm-sdk/`
4. Ask user for clarification if requirements are ambiguous

**Quality gates before moving to next phase**:
- [ ] All tests passing
- [ ] TypeScript compiles without errors
- [ ] Code formatted and linted
- [ ] Documentation updated
- [ ] Phase checklist complete

**Remember**: The SDK is the star, not the examples. Focus on making `fhevm-sdk` incredibly easy to use, with examples serving only as proof of concept.
