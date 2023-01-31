import { existsSync } from 'node:fs'
import { join, sep } from 'node:path'

import { NormalizedPackageJson } from 'read-pkg'

import { getDependencies, getPackage, getWorkspaces } from './package'

const dotted = (path: string) =>
  [path.startsWith('.') ? '' : `.${sep}`, path].join('')

export const getPaths: (
  cwd: string,
  dependencies?: Record<string, string>,
) => Record<string, string[]> = (cwd, dependencies = getDependencies(cwd)) =>
  Object.fromEntries(
    Object.entries(dependencies).map(([dependency, path]) => [
      dependency,
      [dotted(join(path, 'src', 'main', 'ts'))],
    ]),
  )

export const getReferences: (
  cwd: string,
  tsconfig?: string,
  pkg?: NormalizedPackageJson,
  dependencies?: Record<string, string>,
) => { path: string }[] = (
  cwd,
  tsconfig = 'tsconfig.json',
  pkg = getPackage(cwd),
  dependencies = pkg.workspaces
    ? getWorkspaces(cwd, pkg)
    : getDependencies(cwd, pkg),
) =>
  Object.values(dependencies)
    .map((path) => ({
      path: dotted(join(path, tsconfig)),
    }))
    .filter((reference) => existsSync(join(cwd, reference.path)))
