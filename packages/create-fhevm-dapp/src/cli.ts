import { Command } from 'commander'
import path from 'path'
import { askQuestions } from './prompts.js'
import { generateApp, type GeneratorConfig } from './generator.js'
import { logger } from './utils/logger.js'
import { isValidFramework, isValidPackageName, getPackageNameError } from './validator.js'
import { getAvailableTemplates } from './templates.js'
import { pathExists } from './utils/fileSystem.js'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const PACKAGE_MANAGERS = ['pnpm', 'npm', 'yarn'] as const
type PackageManager = (typeof PACKAGE_MANAGERS)[number]

function isSupportedPackageManager(value: string): value is PackageManager {
  return (PACKAGE_MANAGERS as readonly string[]).includes(value)
}

function inferPackageManager(): PackageManager {
  const userAgent = process.env.npm_config_user_agent || ''

  if (userAgent.includes('pnpm')) {
    return 'pnpm'
  }
  if (userAgent.includes('yarn')) {
    return 'yarn'
  }
  if (userAgent.includes('npm')) {
    return 'npm'
  }

  return 'pnpm'
}

export async function run() {
  const packageJson = JSON.parse(
    readFileSync(path.join(__dirname, '../package.json'), 'utf-8')
  )

  const program = new Command()

  program
    .name('create-fhevm-dapp')
    .description('Create FHEVM dApps with framework templates')
    .version(packageJson.version)
    .argument('[framework]', `Framework to use (${getAvailableTemplates().join(', ')})`)
    .argument('[name]', 'App name')
    .option('-f, --framework <type>', 'Framework choice (vue|react)')
    .option('-n, --name <name>', 'App name')
    .option('-s, --skip-install', 'Skip dependency installation', false)
    .option('-p, --package-manager <pm>', 'Package manager (pnpm|npm|yarn)')
    .option('--force', 'Overwrite existing directory', false)
    .action(async (framework?: string, name?: string, options?: any) => {
      try {
        await createApp(framework, name, options)
      } catch (error) {
        logger.error(error instanceof Error ? error.message : 'Unknown error occurred')
        process.exit(1)
      }
    })

  program.parse()
}

async function createApp(
  frameworkArg?: string,
  nameArg?: string,
  options?: any
): Promise<void> {
  let config: Partial<GeneratorConfig> = {
    force: options?.force || false,
    installDeps: !options?.skipInstall
  }

  // Get framework
  const framework = frameworkArg || options?.framework
  if (framework) {
    if (!isValidFramework(framework)) {
      logger.error(
        `Invalid framework: ${framework}. Available: ${getAvailableTemplates().join(', ')}`
      )
      process.exit(1)
    }
    config.framework = framework
  }

  // Get app name
  const appName = nameArg || options?.name
  if (appName) {
    if (!isValidPackageName(appName)) {
      logger.error(getPackageNameError(appName) || 'Invalid app name')
      process.exit(1)
    }
    config.appName = appName
  }

  // Get package manager
  if (options?.packageManager) {
    if (!isSupportedPackageManager(options.packageManager)) {
      logger.error(
        `Invalid package manager: ${options.packageManager}. Available: ${PACKAGE_MANAGERS.join(', ')}`
      )
      process.exit(1)
    }
    config.packageManager = options.packageManager
  }

  if (!config.packageManager) {
    config.packageManager = inferPackageManager()
  }

  // If missing required fields, ask via prompts
  if (!config.framework || !config.appName || !config.packageManager) {
    logger.newLine()
    logger.title('🚀 Create FHEVM dApp')
    logger.newLine()

    const answers = await askQuestions()

    config.framework = config.framework || answers.framework
    config.appName = config.appName || answers.appName
    config.packageManager = config.packageManager || answers.packageManager
    // Interactive mode: install deps by default (unless --skip-install was used)
    // installDeps is already set from options in line 75
    // If user confirmed overwrite in interactive mode, set force to true
    if (answers.overwrite === true) {
      config.force = true
    }
  }

  // Validate and set target directory
  config.targetDir = path.resolve(process.cwd(), config.appName!)

  // Check if directory exists (if not force and not in interactive mode)
  if (!config.force && (await pathExists(config.targetDir))) {
    logger.error(
      `Directory ${config.appName} already exists. Use --force to overwrite.`
    )
    process.exit(1)
  }

  // Generate the app
  logger.newLine()
  logger.title('Creating FHEVM dApp...')
  logger.newLine()

  await generateApp(config as GeneratorConfig)
}
