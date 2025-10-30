export interface TemplateInfo {
  name: string
  description: string
  packageName: string
  available: boolean
}

export const TEMPLATES: Record<string, TemplateInfo> = {
  nextjs: {
    name: 'Next.js',
    description: 'Next.js 15 + @0xbojack/fhevm-nextjs',
    packageName: '@0xbojack/fhevm-nextjs',
    available: true
  },
  react: {
    name: 'React',
    description: 'React + Vite + @0xbojack/fhevm-react',
    packageName: '@0xbojack/fhevm-react',
    available: true
  },
  vue: {
    name: 'Vue',
    description: 'Vue 3 + Vite + @0xbojack/fhevm-vue',
    packageName: '@0xbojack/fhevm-vue',
    available: true
  }
}

export function getAvailableTemplates(): string[] {
  return Object.entries(TEMPLATES)
    .filter(([_, template]) => template.available)
    .map(([key]) => key)
}

export function getTemplateInfo(framework: string): TemplateInfo | null {
  return TEMPLATES[framework] || null
}
