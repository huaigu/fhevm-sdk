import fs from 'fs-extra'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const ROOT = path.join(__dirname, '..')
const EXAMPLES_DIR = path.join(ROOT, 'examples')
const HARDHAT_DIR = path.join(ROOT, 'packages/hardhat')
const TEMPLATES_DIR = path.join(ROOT, 'packages/create-fhevm-dapp/templates')

const FRONTEND_FRAMEWORKS: Record<string, string> = {
  'nextjs-app': 'nextjs',
  'react-app': 'react',
  'vue-app': 'vue'
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
  '.git',
  'cache',
  'artifacts',
  'typechain-types',
  'deployments'
]

async function prepareTemplates() {
  console.log('📦 Preparing monorepo templates...\n')

  // 1. Ensure base, frontend, and hardhat directories exist
  await fs.ensureDir(path.join(TEMPLATES_DIR, 'base'))
  await fs.ensureDir(path.join(TEMPLATES_DIR, 'frontend'))
  await fs.ensureDir(path.join(TEMPLATES_DIR, 'hardhat'))
  console.log('✅ Template directories created\n')

  // 2. Base templates are manually created in templates/base/
  console.log('📁 Base templates (manually created):')
  const baseFiles = await fs.readdir(path.join(TEMPLATES_DIR, 'base'))
  baseFiles.forEach((file) => console.log(`  ✓ ${file}`))
  console.log()

  // 3. Copy frontend templates from examples/
  console.log('📁 Copying frontend templates from examples/...')
  for (const [source, target] of Object.entries(FRONTEND_FRAMEWORKS)) {
    const sourcePath = path.join(EXAMPLES_DIR, source)
    const targetPath = path.join(TEMPLATES_DIR, 'frontend', target)

    if (!(await fs.pathExists(sourcePath))) {
      console.log(`  ⚠️  Skipping ${source} (not found)`)
      continue
    }

    // Remove old template if exists
    await fs.remove(targetPath)

    // Copy frontend code
    await fs.copy(sourcePath, targetPath, {
      filter: (src) => {
        const relativePath = path.relative(sourcePath, src)
        return !EXCLUDE_PATTERNS.some((pattern) => relativePath.includes(pattern))
      }
    })

    // Adjust package.json (name -> "frontend", remove workspace refs)
    const pkgPath = path.join(targetPath, 'package.json')
    if (await fs.pathExists(pkgPath)) {
      const pkg = await fs.readJson(pkgPath)
      pkg.name = 'frontend'
      pkg.private = true

      // Replace workspace:* with actual versions (will be filled by generator)
      if (pkg.dependencies) {
        for (const [dep, version] of Object.entries(pkg.dependencies)) {
          if (version === 'workspace:*') {
            pkg.dependencies[dep] = '{{FHEVM_VERSION}}'
          }
        }
      }

      await fs.writeJson(pkgPath, pkg, { spaces: 2 })
    }

    console.log(`  ✅ Copied ${source} → frontend/${target}`)
  }
  console.log()

  // 4. Copy Hardhat template from packages/hardhat/
  console.log('📁 Copying Hardhat template from packages/hardhat/...')
  const hardhatSource = path.join(HARDHAT_DIR)
  const hardhatTarget = path.join(TEMPLATES_DIR, 'hardhat')

  // Remove old template if exists
  await fs.remove(hardhatTarget)

  // Copy Hardhat files
  await fs.copy(hardhatSource, hardhatTarget, {
    filter: (src) => {
      const relativePath = path.relative(hardhatSource, src)
      return !EXCLUDE_PATTERNS.some((pattern) => relativePath.includes(pattern))
    }
  })

  // Adjust package.json (name -> "hardhat")
  const hardhatPkgPath = path.join(hardhatTarget, 'package.json')
  if (await fs.pathExists(hardhatPkgPath)) {
    const pkg = await fs.readJson(hardhatPkgPath)
    pkg.name = 'hardhat'
    pkg.private = true
    await fs.writeJson(hardhatPkgPath, pkg, { spaces: 2 })
  }

  console.log('  ✅ Copied packages/hardhat → templates/hardhat')
  console.log()

  console.log('🎉 All templates prepared successfully!')
  console.log()
  console.log('Template structure:')
  console.log('  templates/')
  console.log('  ├── base/           # Root configuration files')
  console.log('  ├── frontend/       # Framework templates')
  console.log('  │   ├── nextjs/')
  console.log('  │   ├── react/')
  console.log('  │   └── vue/')
  console.log('  └── hardhat/        # Smart contracts')
}

// Run the script
prepareTemplates().catch((error) => {
  console.error('❌ Error preparing templates:', error)
  process.exit(1)
})
