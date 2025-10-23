import path from 'path'
import { fileURLToPath } from 'url'
import { copyDirectory, ensureDir, pathExists, readJson, writeJson } from './utils/fileSystem.js'
import { createSpinner } from './utils/spinner.js'
import { logger } from './utils/logger.js'
import { getTemplateInfo } from './templates.js'
import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const EXCLUDE_FILES = [
  'node_modules',
  'dist',
  '.next',
  'build',
  '.turbo',
  'tsconfig.tsbuildinfo',
  'pnpm-lock.yaml',
  'yarn.lock',
  'package-lock.json',
  'cache',
  'artifacts',
  'typechain-types',
  'deployments',
  '.vscode',
  'fhevmTemp'
]

export interface GeneratorConfig {
  framework: string
  appName: string
  targetDir: string
  packageManager: string
  installDeps: boolean
  force: boolean
}

export async function generateApp(config: GeneratorConfig): Promise<void> {
  const { framework, appName, targetDir, packageManager, installDeps, force } = config

  // Check if directory exists
  if (await pathExists(targetDir)) {
    if (!force) {
      logger.error(`Directory ${targetDir} already exists. Use --force to overwrite.`)
      process.exit(1)
    }
    logger.warn(`Overwriting directory: ${targetDir}`)
  }

  // Ensure target directory
  await ensureDir(targetDir)

  // Verify templates exist
  const templatesRoot = path.join(__dirname, '../templates')
  const baseTemplate = path.join(templatesRoot, 'base')
  const frontendTemplate = path.join(templatesRoot, 'frontend', framework)
  const hardhatTemplate = path.join(templatesRoot, 'hardhat')

  if (!(await pathExists(frontendTemplate))) {
    logger.error(`Template for ${framework} not found. Please run 'pnpm copy-templates' first.`)
    process.exit(1)
  }

  // 1. Copy base template (root files)
  const baseSpinner = createSpinner('Creating monorepo structure...')
  baseSpinner.start()

  await copyDirectory(baseTemplate, targetDir, {
    exclude: EXCLUDE_FILES,
    transform: (content, filePath) => transformContent(content, filePath, config)
  })

  baseSpinner.succeed('Monorepo structure created')

  // 2. Copy frontend template
  const frontendSpinner = createSpinner(`Copying ${framework} frontend...`)
  frontendSpinner.start()

  const frontendTargetDir = path.join(targetDir, 'packages', 'frontend')
  await ensureDir(frontendTargetDir)

  await copyDirectory(frontendTemplate, frontendTargetDir, {
    exclude: EXCLUDE_FILES,
    transform: (content, filePath) => transformContent(content, filePath, config)
  })

  frontendSpinner.succeed(`${framework} frontend copied`)

  // 3. Copy hardhat template
  const hardhatSpinner = createSpinner('Copying Hardhat contracts...')
  hardhatSpinner.start()

  const hardhatTargetDir = path.join(targetDir, 'packages', 'hardhat')
  await ensureDir(hardhatTargetDir)

  await copyDirectory(hardhatTemplate, hardhatTargetDir, {
    exclude: EXCLUDE_FILES
  })

  hardhatSpinner.succeed('Hardhat contracts copied')

  // 4. Update package.json files
  const pkgSpinner = createSpinner('Updating package.json files...')
  pkgSpinner.start()

  await updateRootPackageJson(targetDir, config)
  await updateFrontendPackageJson(frontendTargetDir, config)

  pkgSpinner.succeed('package.json files updated')

  // 5. Install dependencies
  if (installDeps) {
    const installSpinner = createSpinner(`Installing dependencies with ${packageManager}...`)
    installSpinner.start()

    try {
      await installDependencies(targetDir, packageManager)
      installSpinner.succeed('Dependencies installed')
    } catch (error) {
      installSpinner.fail('Failed to install dependencies')
      logger.warn('You can install dependencies manually by running:')
      logger.dim(`  cd ${appName}`)
      logger.dim(`  ${packageManager} install`)
    }
  }

  // Print success message
  printSuccessMessage(config)
}

function transformContent(content: string, filePath: string, config: GeneratorConfig): string {
  const { appName, framework } = config
  const templateInfo = getTemplateInfo(framework)!

  // Only transform specific file types
  if (
    filePath.endsWith('.json') ||
    filePath.endsWith('.md') ||
    filePath.endsWith('.yaml') ||
    filePath.endsWith('.yml') ||
    filePath.endsWith('.ts') ||
    filePath.endsWith('.tsx') ||
    filePath.endsWith('.vue')
  ) {
    return content
      .replace(/\{\{APP_NAME\}\}/g, appName)
      .replace(/\{\{DESCRIPTION\}\}/g, `FHEVM ${templateInfo.name} dApp`)
      .replace(/\{\{FHEVM_PACKAGE\}\}/g, templateInfo.packageName)
      .replace(/\{\{FRAMEWORK\}\}/g, templateInfo.name)
      .replace(/\{\{FHEVM_VERSION\}\}/g, '^0.2.2')
      .replace(/@fhevm\/(react|vue)/g, templateInfo.packageName) // Replace workspace imports with published package
  }

  return content
}

async function updateRootPackageJson(targetDir: string, config: GeneratorConfig): Promise<void> {
  const pkgPath = path.join(targetDir, 'package.json')
  const pkg = await readJson(pkgPath)

  // Name and description already set by template transformation
  pkg.name = config.appName
  pkg.description = `FHEVM ${config.framework} dApp with monorepo structure`

  await writeJson(pkgPath, pkg)
}

async function updateFrontendPackageJson(
  frontendDir: string,
  config: GeneratorConfig
): Promise<void> {
  const pkgPath = path.join(frontendDir, 'package.json')
  const pkg = await readJson(pkgPath)

  // Replace workspace:* and {{FHEVM_VERSION}} with actual versions
  for (const depType of ['dependencies', 'devDependencies', 'peerDependencies']) {
    if (pkg[depType]) {
      for (const [name, version] of Object.entries(pkg[depType])) {
        if (version === 'workspace:*' || version === '{{FHEVM_VERSION}}') {
          // Use published version
          pkg[depType][name] = '^0.2.2'
        }
      }
    }
  }

  await writeJson(pkgPath, pkg)
}

async function installDependencies(targetDir: string, packageManager: string): Promise<void> {
  const installCommand = packageManager === 'yarn' ? 'yarn' : `${packageManager} install`

  await execAsync(installCommand, {
    cwd: targetDir,
    stdio: 'inherit'
  })
}

function printSuccessMessage(config: GeneratorConfig): void {
  const { appName, framework, packageManager } = config
  const templateInfo = getTemplateInfo(framework)!

  logger.newLine()
  logger.success(`🎉 Created ${appName}!`)
  logger.newLine()

  logger.title('Project Structure (Monorepo):')
  logger.info(`${appName}/`)
  logger.info('├── packages/')
  logger.info(`│   ├── frontend/       # ${templateInfo.name} application`)
  logger.info('│   └── hardhat/        # Smart contracts')
  logger.info('├── package.json')
  logger.info('└── pnpm-workspace.yaml')
  logger.newLine()

  logger.title('Your FHEVM dApp includes:')
  logger.info(`📁 Frontend (${templateInfo.name})`)
  logger.info('📝 Smart Contracts (Hardhat + FHEVM)')
  logger.info('🚀 Deploy Scripts')
  logger.info('🔧 Monorepo Setup (pnpm workspace)')
  logger.newLine()

  logger.title('Available commands:')
  logger.dim(`  ${packageManager} dev`)
  logger.dim('    Starts the frontend dev server')
  logger.newLine()
  logger.dim(`  ${packageManager} chain`)
  logger.dim('    Starts a local Hardhat node')
  logger.newLine()
  logger.dim(`  ${packageManager} compile`)
  logger.dim('    Compiles smart contracts')
  logger.newLine()
  logger.dim(`  ${packageManager} deploy:localhost`)
  logger.dim('    Deploys contracts to local chain')
  logger.newLine()

  logger.title('Get started:')
  logger.dim(`  cd ${appName}`)
  logger.newLine()
  logger.dim('  # Terminal 1: Start local chain')
  logger.dim(`  ${packageManager} chain`)
  logger.newLine()
  logger.dim('  # Terminal 2: Deploy contracts')
  logger.dim(`  ${packageManager} deploy:localhost`)
  logger.newLine()
  logger.dim('  # Terminal 3: Start frontend')
  logger.dim(`  ${packageManager} dev`)
  logger.newLine()

  logger.info('📚 Documentation: https://github.com/0xbojack/fhevm-sdk')
  logger.info('🐛 Issues: https://github.com/0xbojack/fhevm-sdk/issues')
  logger.newLine()
  logger.title('Happy coding! 🚀')
}
