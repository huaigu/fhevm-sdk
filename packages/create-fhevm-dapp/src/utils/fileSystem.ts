import fs from 'fs-extra'
import path from 'path'

export async function copyDirectory(
  src: string,
  dest: string,
  options?: {
    exclude?: string[]
    transform?: (content: string, filePath: string) => string
  }
) {
  const { exclude = [], transform } = options || {}

  await fs.copy(src, dest, {
    filter: (srcPath) => {
      const relativePath = path.relative(src, srcPath)
      return !exclude.some((pattern) => {
        if (pattern.includes('*')) {
          const regex = new RegExp(pattern.replace(/\*/g, '.*'))
          return regex.test(relativePath)
        }
        return relativePath.includes(pattern)
      })
    }
  })

  // Transform files if transform function provided
  if (transform) {
    const files = await getAllFiles(dest)
    for (const file of files) {
      const content = await fs.readFile(file, 'utf-8')
      const transformed = transform(content, file)
      if (transformed !== content) {
        await fs.writeFile(file, transformed, 'utf-8')
      }
    }
  }
}

async function getAllFiles(dir: string): Promise<string[]> {
  const files: string[] = []
  const items = await fs.readdir(dir, { withFileTypes: true })

  for (const item of items) {
    const fullPath = path.join(dir, item.name)
    if (item.isDirectory()) {
      files.push(...(await getAllFiles(fullPath)))
    } else {
      files.push(fullPath)
    }
  }

  return files
}

export async function ensureDir(dir: string) {
  await fs.ensureDir(dir)
}

export async function removeDir(dir: string) {
  await fs.remove(dir)
}

export async function pathExists(p: string) {
  return fs.pathExists(p)
}

export async function readJson<T = any>(filePath: string): Promise<T> {
  return fs.readJson(filePath)
}

export async function writeJson(filePath: string, data: any) {
  await fs.writeJson(filePath, data, { spaces: 2 })
}
