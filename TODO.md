# FHEVM Universal SDK - Implementation TODO

**Project**: Zama Bounty Program (October 2025)
**Deadline**: October 31, 2025 (23:59 AoE)
**Prize Pool**: $10,000

---

## 📊 Overall Progress

- [ ] Phase 0: Infrastructure Setup (1-2 days)
- [ ] Phase 1: Core SDK (@fhevm/core) (4-5 days)
- [ ] Phase 2: React Ecosystem (@fhevm/react + fhevm-sdk) (5 days)
- [ ] Phase 3: Vue Ecosystem (@fhevm/vue) - BONUS (3-4 days)
- [ ] Phase 4: Documentation & Deployment (4-5 days)
- [ ] Phase 5: Final Submission (October 31)

**Current Phase**: Phase 0 - Infrastructure Setup
**Days Remaining**: [Calculate from current date to Oct 31]

---

## Phase 0: Infrastructure Setup ⏱️ 1-2 days

### Repository Structure
- [x] Fork fhevm-react-template (✅ COMPLETED)
- [ ] Clean repo structure
  - [ ] Remove unnecessary template files
  - [ ] Keep existing `packages/fhevm-sdk` for reference
  - [ ] Clean up old documentation
- [ ] Create new pnpm workspace structure
  - [ ] Create `packages/contracts/`
  - [ ] Create `packages/core/`
  - [ ] Create `packages/react/`
  - [ ] Create `packages/vue/` (BONUS)
  - [ ] Restructure `packages/fhevm-sdk/` as aggregator
  - [ ] Create `examples/nextjs-app/`
  - [ ] Create `examples/vue-app/` (BONUS)

### Build Tooling
- [ ] Configure Tsup for library bundling
  - [ ] Setup `tsup.config.ts` for @fhevm/core
  - [ ] Setup `tsup.config.ts` for @fhevm/react
  - [ ] Setup `tsup.config.ts` for @fhevm/vue (BONUS)
- [ ] Configure Vitest for testing
  - [ ] Create `vitest.config.ts` at root
  - [ ] Setup test environment for browser APIs
  - [ ] Configure coverage reporting
- [ ] Setup Changesets for versioning
  - [ ] Install @changesets/cli
  - [ ] Initialize changesets config
  - [ ] Create release script

### Contracts Package
- [ ] Develop EncryptedCounter.sol
  - [ ] Write contract with encrypted counter state
  - [ ] Implement increment(einput) function
  - [ ] Implement decrement(einput) function
  - [ ] Implement getCounter() view function
  - [ ] Add access control if needed
- [ ] Write Hardhat deployment scripts
  - [ ] Local deployment script
  - [ ] Sepolia deployment script
  - [ ] ABI generation script
- [ ] Add contract tests
  - [ ] Test increment functionality
  - [ ] Test decrement functionality
  - [ ] Test access control

### Root Configuration
- [ ] Update `pnpm-workspace.yaml`
  - [ ] Define all workspace packages
  - [ ] Configure workspace dependencies
- [ ] Update root `package.json`
  - [ ] Add root-level build script
  - [ ] Add root-level test script
  - [ ] Add contract:compile script
  - [ ] Add contract:deploy script
  - [ ] Add dev:react script
  - [ ] Add dev:vue script (BONUS)
  - [ ] Add release script
- [ ] Create `tsconfig.base.json`
  - [ ] Shared TypeScript configuration
  - [ ] Path aliases for monorepo
  - [ ] Strict mode settings

---

## Phase 1: Core SDK (@fhevm/core) ⏱️ 4-5 days

### Package Setup
- [ ] Create `packages/core/package.json`
  - [ ] Set package name to @fhevm/core
  - [ ] Configure exports (main, types, module)
  - [ ] Add dependencies (ethers, @zama-fhe/relayer-sdk)
  - [ ] Add devDependencies (tsup, vitest, typescript)
- [ ] Create `packages/core/tsconfig.json`
  - [ ] Extend from base config
  - [ ] Configure output directory
- [ ] Create `packages/core/tsup.config.ts`
  - [ ] Configure entry points
  - [ ] Enable dts generation
  - [ ] Configure formats (esm, cjs)

### Core Implementation
- [ ] Create `FhevmClient.ts` (Main API)
  - [ ] `constructor(config?: FhevmConfig)`
  - [ ] `async init(params: InitParams): Promise<void>`
  - [ ] `async encrypt(params: EncryptParams): Promise<EncryptResult>`
  - [ ] `async decrypt(requests: DecryptRequest[], signer): Promise<DecryptResult>`
  - [ ] `getPublicKey(): string | undefined`
  - [ ] `getStatus(): FhevmStatus`
- [ ] Port utilities from existing SDK
  - [ ] Port `createFhevmInstance` (from `internal/fhevm.ts`)
  - [ ] Port `RelayerSDKLoader` (no changes needed)
  - [ ] Port `PublicKeyStorage` (make storage-agnostic)
  - [ ] Port `FhevmDecryptionSignature` (remove React deps)
  - [ ] Port mock detection logic
  - [ ] Port encryption method mapping
- [ ] Create storage abstraction layer
  - [ ] `StorageAdapter` interface
  - [ ] `MemoryStorage` implementation
  - [ ] `IndexedDBStorage` implementation
  - [ ] `LocalStorageStorage` implementation

### Type Definitions
- [ ] Create `types.ts`
  - [ ] `FhevmConfig` interface
  - [ ] `InitParams` interface
  - [ ] `EncryptParams` interface
  - [ ] `EncryptResult` interface
  - [ ] `DecryptRequest` interface
  - [ ] `DecryptResult` interface
  - [ ] `FhevmStatus` type
  - [ ] `StorageAdapter` interface
- [ ] Export all types from `index.ts`

### Testing
- [ ] Write unit tests
  - [ ] Test FhevmClient initialization
  - [ ] Test mock chain detection
  - [ ] Test encryption methods
  - [ ] Test decryption flow
  - [ ] Test public key caching
  - [ ] Test EIP-712 signature management
  - [ ] Test error handling
- [ ] Achieve >90% code coverage
- [ ] Setup CI for automated testing

### Documentation
- [ ] Add JSDoc comments to all public APIs
- [ ] Create `packages/core/README.md`
  - [ ] Installation instructions
  - [ ] Basic usage example
  - [ ] API reference
  - [ ] Advanced usage patterns

---

## Phase 2: React Ecosystem (@fhevm/react + fhevm-sdk) ⏱️ 5 days

### @fhevm/react Package Setup
- [ ] Create `packages/react/package.json`
  - [ ] Set package name to @fhevm/react
  - [ ] Add peerDependencies (react, @fhevm/core)
  - [ ] Configure exports
- [ ] Create `packages/react/tsconfig.json`
- [ ] Create `packages/react/tsup.config.ts`

### React Provider & Context
- [ ] Create `FhevmProvider.tsx`
  - [ ] Context creation for FhevmClient
  - [ ] Provider component with config props
  - [ ] Internal state management
  - [ ] Instance lifecycle handling
- [ ] Create `useFhevmContext.ts`
  - [ ] Hook to access context
  - [ ] Error handling for missing provider

### React Hooks (Wagmi-like API)
- [ ] Create `useFhevm.ts`
  - [ ] Return `{ instance, status, error }`
  - [ ] Handle initialization states
  - [ ] Cleanup on unmount
- [ ] Create `useEncrypt.ts`
  - [ ] Return `{ encrypt, isEncrypting, error }`
  - [ ] Builder pattern support
  - [ ] Loading state management
- [ ] Create `useDecrypt.ts`
  - [ ] Return `{ decrypt, isDecrypting, results, error }`
  - [ ] Handle signature caching
  - [ ] Request batching
- [ ] Create `useFhevmContract.ts` (optional enhancement)
  - [ ] Contract interaction helpers
  - [ ] Automatic encryption/decryption
  - [ ] Type-safe ABI support

### fhevm-sdk Aggregator Package
- [ ] Create `packages/fhevm-sdk/package.json`
  - [ ] Set package name to fhevm-sdk
  - [ ] Add dependencies (@fhevm/core, @fhevm/react)
  - [ ] Configure exports with subpaths
- [ ] Create `packages/fhevm-sdk/src/index.ts`
  - [ ] Re-export * from '@fhevm/core'
  - [ ] Re-export * from '@fhevm/react'
- [ ] Create barrel exports for convenience
  - [ ] `fhevm-sdk/core` → @fhevm/core
  - [ ] `fhevm-sdk/react` → @fhevm/react

### Next.js Showcase App
- [ ] Create `examples/nextjs-app/`
  - [ ] Initialize Next.js 15 + TypeScript
  - [ ] Install dependencies (fhevm-sdk, wagmi, rainbowkit)
  - [ ] Setup TailwindCSS + DaisyUI
- [ ] Configure app
  - [ ] Create `app/layout.tsx` with providers
  - [ ] Setup RainbowKit + Wagmi
  - [ ] Add FhevmProvider
  - [ ] Configure networks (Hardhat, Sepolia)
- [ ] Build EncryptedCounter demo
  - [ ] Create `app/page.tsx` with counter UI
  - [ ] Implement encrypt → increment flow
  - [ ] Implement encrypt → decrement flow
  - [ ] Implement read → decrypt flow
  - [ ] Add loading states
  - [ ] Add error handling
  - [ ] Add responsive design
- [ ] Add environment setup
  - [ ] Create `.env.example`
  - [ ] Document required variables
  - [ ] Add Alchemy API key requirement

### Testing
- [ ] Write hook tests with @testing-library/react
  - [ ] Test useFhevm hook
  - [ ] Test useEncrypt hook
  - [ ] Test useDecrypt hook
  - [ ] Test FhevmProvider
- [ ] Achieve >80% coverage
- [ ] Test Next.js app manually
  - [ ] Test on local Hardhat node
  - [ ] Test on Sepolia testnet

### Documentation
- [ ] Add JSDoc to all hooks
- [ ] Create `packages/react/README.md`
  - [ ] Installation guide
  - [ ] Provider setup
  - [ ] Hook usage examples
  - [ ] Migration guide from old SDK
- [ ] Create `packages/fhevm-sdk/README.md`
  - [ ] Quick start (<10 lines)
  - [ ] Package structure explanation
  - [ ] Links to subpackage docs
- [ ] Create `examples/nextjs-app/README.md`
  - [ ] Setup instructions
  - [ ] Running locally
  - [ ] Deployment guide

---

## Phase 3: Vue Ecosystem (@fhevm/vue) - BONUS ⏱️ 3-4 days

### @fhevm/vue Package Setup
- [ ] Create `packages/vue/package.json`
  - [ ] Set package name to @fhevm/vue
  - [ ] Add peerDependencies (vue, @fhevm/core)
  - [ ] Configure exports
- [ ] Create `packages/vue/tsconfig.json`
- [ ] Create `packages/vue/tsup.config.ts`

### Vue Plugin & Composables
- [ ] Create `plugin.ts`
  - [ ] `createFhevm(config)` factory function
  - [ ] Vue plugin install method
  - [ ] Provide FhevmClient to app
- [ ] Create `useFhevm.ts`
  - [ ] Use inject() to access instance
  - [ ] Return reactive refs
  - [ ] Return `{ instance, status, error }`
- [ ] Create `useEncrypt.ts`
  - [ ] Return reactive encryption state
  - [ ] Return `{ encrypt, isEncrypting, error }`
- [ ] Create `useDecrypt.ts`
  - [ ] Return reactive decryption state
  - [ ] Return `{ decrypt, isDecrypting, results, error }`

### Vue Showcase App
- [ ] Create `examples/vue-app/`
  - [ ] Initialize Vue 3 + Vite + TypeScript
  - [ ] Install dependencies (@fhevm/vue, ethers)
  - [ ] Setup TailwindCSS
- [ ] Configure app
  - [ ] Install fhevm plugin in `main.ts`
  - [ ] Setup wallet connection
  - [ ] Configure networks
- [ ] Build EncryptedCounter demo
  - [ ] Create counter component
  - [ ] Implement same flows as Next.js
  - [ ] Add responsive design
- [ ] Add environment setup

### Testing
- [ ] Write composable tests with Vitest
  - [ ] Test useFhevm
  - [ ] Test useEncrypt
  - [ ] Test useDecrypt
- [ ] Achieve >80% coverage
- [ ] Test Vue app manually

### Documentation
- [ ] Add JSDoc to all composables
- [ ] Create `packages/vue/README.md`
  - [ ] Installation guide
  - [ ] Plugin setup
  - [ ] Composable usage
- [ ] Create `examples/vue-app/README.md`

---

## Phase 4: Documentation & Deployment ⏱️ 4-5 days

### Root Documentation
- [ ] Update root `README.md`
  - [ ] Add project banner/logo
  - [ ] Write compelling introduction
  - [ ] Add architecture diagram (mermaid or image)
  - [ ] Write quick start guide (<10 lines)
  - [ ] Add installation instructions
  - [ ] Link to all package docs
  - [ ] Add deployment links
  - [ ] Embed video walkthrough
  - [ ] Add badges (build status, coverage, NPM)
  - [ ] Add contributing guide
  - [ ] Add license section
- [ ] Create `CONTRIBUTING.md`
  - [ ] Development setup
  - [ ] Coding standards
  - [ ] Testing requirements
  - [ ] PR process
- [ ] Update `docs/` folder
  - [ ] Keep PRD for reference
  - [ ] Keep bounty requirements
  - [ ] Add architecture documentation

### Package Documentation
- [ ] Finalize `packages/core/README.md`
  - [ ] Complete API reference
  - [ ] Add migration guide
  - [ ] Add troubleshooting section
- [ ] Finalize `packages/react/README.md`
  - [ ] Add advanced patterns
  - [ ] Add FAQ section
- [ ] Finalize `packages/vue/README.md` (BONUS)
- [ ] Finalize `packages/fhevm-sdk/README.md`

### Example Documentation
- [ ] Finalize `examples/nextjs-app/README.md`
  - [ ] Step-by-step setup
  - [ ] Common issues
  - [ ] Deployment instructions
- [ ] Finalize `examples/vue-app/README.md` (BONUS)

### Code Documentation
- [ ] Ensure all public APIs have JSDoc
- [ ] Add inline code examples
- [ ] Add TypeScript type annotations
- [ ] Generate API documentation (optional)

### Deployments
- [ ] Deploy Next.js app to Vercel
  - [ ] Connect GitHub repository
  - [ ] Configure build settings
  - [ ] Add environment variables
    - [ ] NEXT_PUBLIC_ALCHEMY_API_KEY
    - [ ] NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID
  - [ ] Test deployment on Sepolia
  - [ ] Get production URL
  - [ ] Add URL to README
- [ ] Deploy Vue app to Netlify (BONUS)
  - [ ] Connect GitHub repository
  - [ ] Configure build settings
  - [ ] Add environment variables
  - [ ] Test deployment
  - [ ] Get production URL
  - [ ] Add URL to README

### NPM Publishing (Optional but Recommended)
- [ ] Setup NPM organization (@fhevm or similar)
- [ ] Configure package.json for publishing
  - [ ] Add repository field
  - [ ] Add keywords
  - [ ] Add license
  - [ ] Set public access
- [ ] Create Changesets
  - [ ] Write changeset for @fhevm/core
  - [ ] Write changeset for @fhevm/react
  - [ ] Write changeset for @fhevm/vue (BONUS)
  - [ ] Write changeset for fhevm-sdk
- [ ] Publish packages
  - [ ] Run `pnpm changeset version`
  - [ ] Run `pnpm build`
  - [ ] Run `pnpm changeset publish`
  - [ ] Verify packages on NPM
- [ ] Add NPM badges to README

### Video Walkthrough
- [ ] Write script (3-5 minutes)
  - [ ] Introduction (30s): Problem & solution
  - [ ] Architecture (1m): Show monorepo structure
  - [ ] Demo (2m): Install → encrypt → decrypt
  - [ ] Multi-framework (1m): React + Vue (BONUS)
  - [ ] Closing (30s): Links & CTA
- [ ] Prepare demo environment
  - [ ] Clean terminal setup
  - [ ] High contrast theme
  - [ ] Large font (18-20pt)
  - [ ] Test run through
- [ ] Record screen capture
  - [ ] Record in 1080p or higher
  - [ ] Use Loom, OBS, or QuickTime
  - [ ] Show installation
  - [ ] Walk through code
  - [ ] Demo live apps
- [ ] Edit video
  - [ ] Add intro/outro
  - [ ] Add chapter markers
  - [ ] Add captions if possible
- [ ] Upload to YouTube/Loom
  - [ ] Write descriptive title
  - [ ] Add detailed description
  - [ ] Add timestamps in description
  - [ ] Add links to repo and deployments
- [ ] Embed in README

---

## Phase 5: Final Submission ⏱️ October 31, 2025

### Code Quality Check
- [ ] Run full test suite
  - [ ] `pnpm test` passes
  - [ ] All packages >80% coverage
- [ ] TypeScript check
  - [ ] `pnpm check-types` (root)
  - [ ] No errors in any package
- [ ] Linting
  - [ ] `pnpm lint` passes
  - [ ] Fix any warnings
- [ ] Formatting
  - [ ] `pnpm format` applied
  - [ ] Consistent code style

### Documentation Review
- [ ] All READMEs complete
  - [ ] Root README
  - [ ] All package READMEs
  - [ ] All example READMEs
- [ ] JSDoc coverage
  - [ ] All public APIs documented
  - [ ] Examples in comments
- [ ] Video published
  - [ ] YouTube/Loom link working
  - [ ] Embedded in README

### Deployment Verification
- [ ] Next.js app live and accessible
  - [ ] Test on desktop
  - [ ] Test on mobile
  - [ ] Verify all features work
- [ ] Vue app live and accessible (BONUS)
  - [ ] Test on desktop
  - [ ] Test on mobile
- [ ] All deployment links working in README

### Repository Cleanup
- [ ] Remove debug code
  - [ ] No console.logs in production
  - [ ] No commented-out code
  - [ ] No TODO comments
- [ ] Update .gitignore
  - [ ] Ignore build artifacts
  - [ ] Ignore .env files
  - [ ] Ignore IDE configs
- [ ] Verify commit history
  - [ ] Fork history preserved
  - [ ] Meaningful commit messages
  - [ ] No sensitive data in commits

### Final Review
- [ ] Test installation from scratch
  - [ ] Clone fresh repo
  - [ ] Run `pnpm install`
  - [ ] Run `pnpm build`
  - [ ] Run `pnpm test`
  - [ ] Start example apps
- [ ] Verify <10 lines to get started
  - [ ] Quick start in README is accurate
  - [ ] Actually test the quick start code
- [ ] Cross-reference bounty requirements
  - [ ] Framework-agnostic core ✓
  - [ ] Wagmi-like structure ✓
  - [ ] Wrapper around dependencies ✓
  - [ ] Next.js showcase ✓
  - [ ] Vue showcase (BONUS) ✓
  - [ ] Video walkthrough ✓
  - [ ] Deployment links ✓

### Submission
- [ ] Prepare submission materials
  - [ ] GitHub repo URL
  - [ ] Video link
  - [ ] Deployment link(s)
  - [ ] Brief description
- [ ] Submit to Zama bounty program
  - [ ] Follow submission guidelines
  - [ ] Include all required information
  - [ ] Verify submission received
- [ ] Verify submission deadline
  - [ ] October 31, 2025 23:59 AoE
  - [ ] Convert to your timezone
  - [ ] Submit with buffer time

---

## 🎯 Judging Criteria Alignment

### Usability (40%)
- [ ] <10 lines to get started (verified in README)
- [ ] Minimal boilerplate (demonstrated in examples)
- [ ] Clear installation instructions
- [ ] Intuitive API design

### Completeness (30%)
- [ ] Initialization ✓
- [ ] Encrypted inputs ✓
- [ ] User decryption (EIP-712) ✓
- [ ] Public decryption ✓
- [ ] Contract interactions ✓

### Reusability (20%)
- [ ] Framework-agnostic core
- [ ] Clean module boundaries
- [ ] Works in Node.js, Next.js, React, Vue
- [ ] Documented extension points

### Documentation (10%)
- [ ] Clear README with examples
- [ ] API documentation
- [ ] Video walkthrough
- [ ] Straightforward onboarding

### Creativity (Bonus)
- [ ] Multi-environment showcase (React + Vue)
- [ ] Innovative patterns
- [ ] Additional features beyond requirements

---

## 📝 Notes

**Daily Progress Tracking**: Update this file daily with completed tasks.

**Blockers**: Document any blockers immediately and create mitigation plans.

**Time Buffer**: Aim to complete 1-2 days before deadline for final polish.

**Quality > Features**: Core quality is more important than bonus features. Only pursue Vue if time permits.

**Communication**: Keep user updated on progress and blockers.

---

## 🔗 Quick Links

- [Bounty Requirements](./docs/bountry.md)
- [PRD Design](./docs/prd.md)
- [CLAUDE.md Guide](./CLAUDE.md)
- [Existing SDK Reference](./packages/fhevm-sdk/)
