import prompts from 'prompts'
import path from 'path'
import { TEMPLATES, getAvailableTemplates } from './templates.js'
import { isValidPackageName, getPackageNameError } from './validator.js'
import { pathExists } from './utils/fileSystem.js'

export interface PromptAnswers {
  framework: string
  appName: string
  packageManager: string
  overwrite?: boolean
}

export async function askQuestions(): Promise<PromptAnswers> {
  const availableFrameworks = getAvailableTemplates()

  const answers = await prompts(
    [
      {
        type: 'select',
        name: 'framework',
        message: 'Which framework do you want to use?',
        choices: Object.entries(TEMPLATES).map(([key, template]) => ({
          title: template.name,
          value: key,
          description: template.description,
          disabled: !template.available
        })),
        initial: 0
      },
      {
        type: 'text',
        name: 'appName',
        message: 'What is your project name?',
        initial: 'my-fhevm-dapp',
        validate: (value: string) => {
          if (!value) {
            return 'Project name is required'
          }
          if (!isValidPackageName(value)) {
            const error = getPackageNameError(value)
            return error || 'Invalid project name'
          }
          return true
        }
      },
      {
        type: (prev, values) => {
          const targetDir = path.resolve(process.cwd(), values.appName)
          return pathExists(targetDir).then((exists) => (exists ? 'confirm' : null))
        },
        name: 'overwrite',
        message: (prev, values) =>
          `Directory ${values.appName} already exists. Overwrite?`,
        initial: false
      },
      {
        type: (prev, values) => {
          // If user declined to overwrite, exit
          if (values.overwrite === false) {
            console.log('\nOperation cancelled')
            process.exit(0)
          }
          return null
        },
        name: '_exit'
      },
      {
        type: 'select',
        name: 'packageManager',
        message: 'Which package manager?',
        choices: [
          { title: 'pnpm (recommended)', value: 'pnpm' },
          { title: 'npm', value: 'npm' },
          { title: 'yarn', value: 'yarn' }
        ],
        initial: 0
      }
    ],
    {
      onCancel: () => {
        console.log('\nOperation cancelled')
        process.exit(0)
      }
    }
  )

  return answers as PromptAnswers
}
