import { existsSync } from 'node:fs'
import { join, sep } from 'node:path'

import { NormalizedPackageJson } from 'read-pkg'

import { getDependencies, getPackage, getWorkspaces } from './package'

export const getModuleNameMapper: (
  cwd: string,
  root: string,
  pkg?: NormalizedPackageJson,
  dependencies?: Record<string, string>,
) => Record<string, string> = (
  cwd,
  root,
  pkg = getPackage(cwd, root),
  dependencies = getDependencies(cwd, root, pkg),
) =>
  Object.fromEntries(
    Object.entries(dependencies)
      .map(([dependency, path]) => [
        dependency,
        join(path, 'src', 'main', 'ts'),
      ])
      .map(([dependency, path]) => [dependency, `<rootDir>${sep}${path}`]),
  )

export const getProjects: (
  cwd: string,
  root: string,
  pkg?: NormalizedPackageJson,
  dependencies?: Record<string, string>,
) => string[] = (
  cwd,
  root,
  pkg = getPackage(cwd, root),
  workspaces = getWorkspaces(cwd, root, pkg),
) =>
  Object.values(workspaces)
    .map((path) => join(path, 'jest.config.json'))
    .filter((path) => existsSync(join(root, cwd, path)))
    .map((path) => `<rootDir>${sep}${path}`)
