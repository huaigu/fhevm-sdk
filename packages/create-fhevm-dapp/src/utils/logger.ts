import chalk from 'chalk'

export const logger = {
  success: (message: string) => {
    console.log(chalk.green('✔'), message)
  },

  error: (message: string) => {
    console.error(chalk.red('✖'), chalk.bold('Error:'), message)
  },

  info: (message: string) => {
    console.log(chalk.blue('ℹ'), message)
  },

  warn: (message: string) => {
    console.log(chalk.yellow('⚠'), message)
  },

  title: (message: string) => {
    console.log(chalk.bold.cyan(message))
  },

  dim: (message: string) => {
    console.log(chalk.dim(message))
  },

  newLine: () => {
    console.log()
  }
}
