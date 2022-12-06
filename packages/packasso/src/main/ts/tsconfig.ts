import { join } from 'node:path'

const dotted = (path: string) => `${path.startsWith('.') ? '' : './'}${path}`

export const getPaths = (dependencies: Record<string, string>) =>
  Object.fromEntries(
    Object.entries(dependencies).map(([dependency, path]) => [
      dependency,
      [dotted(join(path, 'src', 'main', 'ts'))],
    ]),
  )

export const getReferences = (
  cwd: string,
  dependencies: Record<string, string>,
  tsconfig: string,
) =>
  Object.values(dependencies).map((path) => ({
    path: dotted(join(path, tsconfig)),
  }))
