import validateNpmPackageName from 'validate-npm-package-name'

export function isValidPackageName(name: string): boolean {
  const result = validateNpmPackageName(name)
  return result.validForNewPackages
}

export function getPackageNameError(name: string): string | null {
  const result = validateNpmPackageName(name)

  if (result.validForNewPackages) {
    return null
  }

  if (result.errors) {
    return result.errors[0]
  }

  if (result.warnings) {
    return result.warnings[0]
  }

  return 'Invalid package name'
}

export function isValidFramework(framework: string): framework is 'vue' | 'react' {
  return framework === 'vue' || framework === 'react'
}

export function isValidPackageManager(pm: string): pm is 'pnpm' | 'npm' | 'yarn' {
  return pm === 'pnpm' || pm === 'npm' || pm === 'yarn'
}
