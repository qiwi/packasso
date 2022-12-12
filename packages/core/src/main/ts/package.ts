import { realpathSync } from 'node:fs'
import { dirname, join, relative, resolve } from 'node:path'

import fg from 'fast-glob'
import { findUpSync } from 'find-up'
import { PackageJson, readPackageSync } from 'read-pkg'

export const getPackage = (cwd: string) => readPackageSync({ cwd })

export const getModulesDir = (cwd: string) => {
  return resolve(
    dirname(findUpSync('yarn.lock', { type: 'file', cwd }) || ''),
    'node_modules',
  )
}

export const getDependencies = (cwd: string, pkg: PackageJson) => {
  const modules = getModulesDir(cwd)
  return Object.fromEntries(
    Object.keys(pkg.dependencies || [])
      .map((dependency) => {
        const path = join(modules, dependency)
        const realPath = realpathSync(path)
        const relativePath = relative(cwd, realPath)
        return {
          dependency,
          path,
          realPath,
          relativePath,
        }
      })
      .filter(({ path, realPath }) => path !== realPath)
      .map(({ dependency, relativePath }) => [dependency, relativePath]),
  )
}

export const getWorkspaces = (cwd: string, pkg: PackageJson) =>
  Object.fromEntries(
    fg
      .sync(
        (Array.isArray(pkg.workspaces) ? pkg.workspaces : []).map((workspace) =>
          join(workspace, 'package.json'),
        ),
        {
          cwd,
        },
      )
      .map((path) => [path, relative(cwd, dirname(path))]),
  )

export type { PackageJson } from 'read-pkg'
