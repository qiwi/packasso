import { join, sep } from 'node:path'

import { NormalizedPackageJson } from 'read-pkg'

import { getDependencies, getPackage } from './package'

export const getModuleNameMapper: (
  cwd: string,
  pkg?: NormalizedPackageJson,
  dependencies?: Record<string, string>,
) => Record<string, string> = (
  cwd,
  pkg = getPackage(cwd),
  dependencies = getDependencies(cwd, pkg),
) => {
  return Object.fromEntries(
    Object.entries(dependencies)
      .map(([dependency, path]) => [
        dependency,
        join(path, 'src', 'main', 'ts'),
      ])
      .map(([dependency, path]) => [dependency, `<rootDir>${sep}${path}`]),
  )
}
