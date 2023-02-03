import { existsSync } from 'node:fs'
import { join, sep } from 'node:path'

import { NormalizedPackageJson } from 'read-pkg'

import { getDependencies, getPackage, getWorkspaces } from './package'

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

export const getProjects: (
  cwd: string,
  pkg?: NormalizedPackageJson,
  dependencies?: Record<string, string>,
) => string[] = (
  cwd,
  pkg = getPackage(cwd),
  workspaces = getWorkspaces(cwd, pkg),
) =>
  Object.values(workspaces)
    .map((path) => join(path, 'jest.config.json'))
    .filter((path) => existsSync(join(cwd, path)))
    .map((path) => `<rootDir>/${path}`)
