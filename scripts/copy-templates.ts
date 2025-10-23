import fs from 'fs-extra'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const EXAMPLES_DIR = path.join(__dirname, '../examples')
const HARDHAT_DIR = path.join(__dirname, '../packages/hardhat')
const TEMPLATES_DIR = path.join(__dirname, '../packages/create-fhevm-dapp/templates')
const ROOT_PACKAGE = path.join(__dirname, '../package.json')

const TEMPLATE_MAP: Record<string, string> = {
  'vue-app': 'vue',
  'nextjs-app': 'nextjs',
  'react-app': 'react'
}

const EXCLUDE_PATTERNS = [
  'node_modules',
  'dist',
  '.next',
  'build',
  '.turbo',
  'tsconfig.tsbuildinfo',
  'pnpm-lock.yaml',
  'yarn.lock',
  'package-lock.json',
  '.git'
]

async function copyTemplates() {
  console.log('📦 Copying templates...\n')

  // Clear existing templates
  await fs.emptyDir(TEMPLATES_DIR)
  console.log('✅ Cleared templates directory')

  // Copy each example to templates
  for (const [source, target] of Object.entries(TEMPLATE_MAP)) {
    const sourcePath = path.join(EXAMPLES_DIR, source)
    const targetPath = path.join(TEMPLATES_DIR, target)

    // Check if source exists
    if (!(await fs.pathExists(sourcePath))) {
      console.log(`⚠️  Skipping ${source} (not found)`)
      continue
    }

    console.log(`\n📁 Processing ${source} → templates/${target}`)

    // 1. Copy frontend code
    await fs.copy(sourcePath, targetPath, {
      filter: (src) => {
        const relativePath = path.relative(sourcePath, src)
        return !EXCLUDE_PATTERNS.some((pattern) => relativePath.includes(pattern))
      }
    })
    console.log('  ✅ Copied frontend code')

    // 2. Copy contracts
    const contractsSrc = path.join(HARDHAT_DIR, 'contracts')
    const contractsDest = path.join(targetPath, 'contracts')
    if (await fs.pathExists(contractsSrc)) {
      await fs.copy(contractsSrc, contractsDest)
      console.log('  ✅ Copied contracts/')
    }

    // 3. Copy deploy scripts
    const deploySrc = path.join(HARDHAT_DIR, 'deploy')
    const deployDest = path.join(targetPath, 'deploy')
    if (await fs.pathExists(deploySrc)) {
      await fs.copy(deploySrc, deployDest)
      console.log('  ✅ Copied deploy/')
    }

    // 4. Copy hardhat config
    const hardhatConfigSrc = path.join(HARDHAT_DIR, 'hardhat.config.ts')
    const hardhatConfigDest = path.join(targetPath, 'hardhat.config.ts')
    if (await fs.pathExists(hardhatConfigSrc)) {
      await fs.copy(hardhatConfigSrc, hardhatConfigDest)
      console.log('  ✅ Copied hardhat.config.ts')
    }

    // 5. Merge package.json with contract scripts
    await mergePackageJson(targetPath, ROOT_PACKAGE, HARDHAT_DIR)
    console.log('  ✅ Merged package.json')

    // 6. Create template README
    await createTemplateReadme(targetPath, target)
    console.log('  ✅ Created README template')

    console.log(`\n✅ Successfully created template: ${target}`)
  }

  console.log('\n🎉 All templates copied successfully!')
}

async function mergePackageJson(
  targetPath: string,
  rootPackagePath: string,
  hardhatPath: string
) {
  const templatePkg = await fs.readJson(path.join(targetPath, 'package.json'))
  const rootPkg = await fs.readJson(rootPackagePath)
  const hardhatPkg = await fs.readJson(path.join(hardhatPath, 'package.json'))

  // Extract contract scripts from root
  const contractScripts: Record<string, string> = {}

  // Map root scripts to template scripts
  if (rootPkg.scripts) {
    const scriptMappings: Record<string, string> = {
      'chain': 'hardhat:chain',
      'compile': 'hardhat:compile',
      'deploy:localhost': 'hardhat:deploy',
      'deploy:sepolia': 'hardhat:deploy:sepolia'
    }

    for (const [newKey, oldKey] of Object.entries(scriptMappings)) {
      if (rootPkg.scripts[oldKey]) {
        // Extract the actual command (remove pnpm --filter part)
        let command = rootPkg.scripts[oldKey]
        if (command.startsWith('pnpm --filter')) {
          // Get the actual hardhat command
          command = command.split(' ').slice(3).join(' ')
        }
        contractScripts[newKey] = command
      }
    }
  }

  // Also get scripts directly from hardhat package
  if (hardhatPkg.scripts) {
    if (hardhatPkg.scripts.chain) contractScripts.chain = hardhatPkg.scripts.chain
    if (hardhatPkg.scripts['deploy:localhost'])
      contractScripts['deploy:localhost'] = hardhatPkg.scripts['deploy:localhost']
    if (hardhatPkg.scripts['deploy:sepolia'])
      contractScripts['deploy:sepolia'] = hardhatPkg.scripts['deploy:sepolia']
    if (!contractScripts.compile && hardhatPkg.scripts.compile)
      contractScripts.compile = hardhatPkg.scripts.compile
  }

  // Merge scripts
  templatePkg.scripts = {
    ...templatePkg.scripts,
    ...contractScripts
  }

  // Add hardhat dependencies
  templatePkg.devDependencies = {
    ...templatePkg.devDependencies,
    ...extractHardhatDependencies(hardhatPkg)
  }

  // Add ethers if not present
  if (!templatePkg.dependencies.ethers) {
    templatePkg.dependencies.ethers = hardhatPkg.devDependencies.ethers || '^6.13.4'
  }

  // Save merged package.json
  await fs.writeJson(path.join(targetPath, 'package.json'), templatePkg, { spaces: 2 })
}

function extractHardhatDependencies(hardhatPkg: any): Record<string, string> {
  const deps: Record<string, string> = {}

  // Essential hardhat dependencies
  const essentialDeps = [
    'hardhat',
    'hardhat-deploy',
    '@fhevm/hardhat-plugin',
    '@fhevm/solidity',
    '@nomicfoundation/hardhat-ethers',
    '@typechain/hardhat',
    'typechain',
    '@nomicfoundation/hardhat-chai-matchers',
    '@typechain/ethers-v6',
    'ts-node',
    'cross-env'
  ]

  for (const dep of essentialDeps) {
    if (hardhatPkg.devDependencies?.[dep]) {
      deps[dep] = hardhatPkg.devDependencies[dep]
    }
    if (hardhatPkg.dependencies?.[dep]) {
      deps[dep] = hardhatPkg.dependencies[dep]
    }
  }

  return deps
}

async function createTemplateReadme(targetPath: string, framework: string) {
  const readmePath = path.join(targetPath, 'README.template.md')

  const content = `# {{APP_NAME}}

{{DESCRIPTION}}

## Quick Start

### 1. Install Dependencies

\`\`\`bash
pnpm install
\`\`\`

### 2. Start Local Chain

\`\`\`bash
pnpm chain
\`\`\`

### 3. Deploy Contracts (new terminal)

\`\`\`bash
pnpm deploy:localhost
\`\`\`

### 4. Start Frontend (new terminal)

\`\`\`bash
pnpm dev
\`\`\`

## Project Structure

\`\`\`
├── contracts/        # FHEVM smart contracts
├── deploy/           # Hardhat deploy scripts
├── src/              # Frontend source
├── hardhat.config.ts # Hardhat configuration
└── package.json
\`\`\`

## Available Scripts

- \`pnpm dev\` - Start frontend dev server
- \`pnpm build\` - Build frontend for production
- \`pnpm chain\` - Start local Hardhat node
- \`pnpm compile\` - Compile smart contracts
- \`pnpm deploy:localhost\` - Deploy to local chain
- \`pnpm deploy:sepolia\` - Deploy to Sepolia testnet

## Smart Contracts

### FHECounter

Encrypted counter demonstrating FHEVM capabilities.

**Functions:**
- \`increment(encryptedValue, proof)\` - Add encrypted value
- \`decrement(encryptedValue, proof)\` - Subtract encrypted value
- \`getCount()\` - Get encrypted count (requires client decryption)
- \`requestDecryptCount()\` - Request on-chain decryption

## Environment Variables

Copy \`.env.example\` to \`.env\` and fill in:

\`\`\`
VITE_SEPOLIA_RPC_URL=your_rpc_url
VITE_CONTRACT_ADDRESS=deployed_contract_address
\`\`\`

## Learn More

- [FHEVM Documentation](https://docs.zama.ai)
- [FHEVM SDK](https://github.com/0xbojack/fhevm-sdk)
`

  await fs.writeFile(readmePath, content, 'utf-8')
}

// Run the script
copyTemplates().catch((error) => {
  console.error('❌ Error copying templates:', error)
  process.exit(1)
})
