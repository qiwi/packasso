import { realpathSync } from 'node:fs'
import { dirname, join, sep } from 'node:path'
import process from 'node:process'

import { gitRoot } from '@antongolub/git-root'
import { findUpSync } from 'find-up'

import { getDependencies } from './topo'
import { ExtraPackageEntry, ExtraTopoContext } from './types'

export const getRoot: (cwd: string) => string = (cwd) => {
  const gitRootRes = gitRoot.sync(cwd)
  if (!gitRootRes) {
    throw new Error('can`t get git root')
  }
  return gitRootRes.toString()
}

export const getNodeModules: () => string = () => {
  const node_modules = findUpSync('node_modules', {
    cwd: dirname(realpathSync(process.argv[1])),
    type: 'directory',
  })
  if (!node_modules) {
    throw new Error('can`t get node_modules')
  }
  return node_modules
}

export const getJestModuleNameMapper: (
  pkg: ExtraPackageEntry,
  topo: ExtraTopoContext,
) => Record<string, string> = (pkg, topo) =>
  Object.fromEntries(
    getDependencies(pkg, topo).map(([name, path]) => [
      name,
      ['<rootDir>', join(path, 'src', 'main', 'ts')].join(sep),
    ]),
  )

export const getJestProjects: (
  pkg: ExtraPackageEntry,
  topo: ExtraTopoContext,
) => string[] = (pkg, topo) =>
  getDependencies(pkg, topo, 'jest.config.json').map(([, path]) =>
    ['<rootDir>', join(path, 'jest.config.json')].join(sep),
  )

const dotted = (path: string) =>
  [
    path.startsWith(`.${sep}`) || path.startsWith(`..${sep}`) ? '' : `.${sep}`,
    path,
  ].join('')

export const getTypeScriptPaths: (
  pkg: ExtraPackageEntry,
  topo: ExtraTopoContext,
) => Record<string, string[]> = (pkg, topo) =>
  Object.fromEntries<string[]>(
    getDependencies(pkg, topo, 'tsconfig.json').map(([name, path]) => [
      name,
      [dotted(join(path, 'src', 'main', 'ts'))],
    ]),
  )

export const getTypeScriptReferences: (
  pkg: ExtraPackageEntry,
  topo: ExtraTopoContext,
  tsconfig: string,
) => { path: string }[] = (pkg, topo, tsconfig) =>
  getDependencies(pkg, topo, tsconfig).map(([, path]) => ({
    path: dotted(join(path, tsconfig)),
  }))
