import { realpathSync } from 'node:fs'
import { dirname, join, relative } from 'node:path'

import { gitRootSync } from '@antongolub/git-root'
import fg from 'fast-glob'
import { NormalizedPackageJson, readPackageSync } from 'read-pkg'

export const getPackage: (cwd: string) => NormalizedPackageJson = (cwd) =>
  readPackageSync({ cwd })

export const getRootDir = (cwd: string) => {
  return gitRootSync(cwd)?.toString() || cwd
}

export const getModulesDir = (cwd: string) => {
  return join(getRootDir(cwd), 'node_modules')
}

export const getDependencies: (
  cwd: string,
  pkg?: NormalizedPackageJson,
) => Record<string, string> = (cwd, pkg = getPackage(cwd)) => {
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

export const getWorkspaces: (
  cwd: string,
  pkg?: NormalizedPackageJson,
) => Record<string, string> = (cwd, pkg = getPackage(cwd)) =>
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
