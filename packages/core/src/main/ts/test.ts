import { join } from 'node:path'

export const getModuleNameMapper = (dependencies: Record<string, string>) => {
  return Object.fromEntries(
    Object.entries(dependencies)
      .map(([dependency, path]) => [
        dependency,
        join(path, 'src', 'main', 'ts'),
      ])
      .map(([dependency, path]) => [dependency, `<rootDir>/${path}`]),
  )
}
