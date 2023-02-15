import { realpathSync } from 'node:fs'
import { dirname, join, relative, resolve } from 'node:path'

import { gitRootSync } from '@antongolub/git-root'
import fg from 'fast-glob'
import { NormalizedPackageJson, readPackageSync } from 'read-pkg'

export const getPackage: (
  cwd: string,
  root?: string,
) => NormalizedPackageJson = (cwd, root = cwd) =>
  readPackageSync({ cwd: resolve(root, cwd) })

export const getRootDir = (cwd: string) => {
  return gitRootSync(cwd)?.toString() || cwd
}

export const getDependencies: (
  cwd: string,
  root: string,
  pkg?: NormalizedPackageJson,
) => Record<string, string> = (cwd, root, pkg = getPackage(cwd, root)) =>
  Object.fromEntries(
    Object.entries(pkg.dependencies || [])
      .filter(
        ([dependency, version]) => dependency && version === 'workspace:*',
      )
      .map(([dependency]) => {
        const path = join(root, 'node_modules', dependency)
        const realPath = realpathSync(path)
        const relativePath = relative(join(root, cwd), realPath)
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

export const getWorkspaces: (
  cwd: string,
  root: string,
  pkg?: NormalizedPackageJson,
) => Record<string, string> = (cwd, root, pkg = getPackage(cwd, root)) =>
  Object.fromEntries(
    fg
      .sync(
        (Array.isArray(pkg.workspaces) ? pkg.workspaces : []).map((workspace) =>
          join(workspace, 'package.json'),
        ),
        {
          cwd: join(root, cwd),
        },
      )
      .map((path) => [path, relative(join(root, cwd), dirname(path))]),
  )
