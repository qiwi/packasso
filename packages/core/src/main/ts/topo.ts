import { existsSync } from 'node:fs'
import { join, relative } from 'node:path'

import { ITopoOptions, topo } from '@semrel-extra/topo'
import { cosmiconfig } from 'cosmiconfig'
import lodash from 'lodash'

import { ExtraPackageEntry, ExtraTopoContext } from './types'

export const getConfig: (cwd: string) => Promise<string[]> = async (cwd) => {
  const result = await cosmiconfig('packasso').search(cwd)
  return lodash.uniqWith([result?.config || []].flat(), lodash.isEqual)
}

export const getExtraTopo: (
  options?: ITopoOptions,
) => Promise<ExtraTopoContext> = async (options) => {
  const context = await topo(options)
  const packages = Object.fromEntries(
    await Promise.all(
      Object.entries(context.packages).map<
        Promise<[string, ExtraPackageEntry]>
      >(async ([name, pkg]) => [
        name,
        {
          ...pkg,
          leaf: true,
          unit: false,
          tree: false,
          modules: await getConfig(pkg.absPath),
        },
      ]),
    ),
  )
  const root = {
    ...context.root,
    relPath: '.',
    leaf: false,
    unit: !context.root.manifest.workspaces,
    tree: !!context.root.manifest.workspaces,
    modules: lodash.uniqWith(
      [
        ...Object.values(packages).flatMap(({ modules }) => modules),
        ...(await getConfig(context.root.absPath)),
      ],
      lodash.isEqual,
    ),
  }
  return {
    ...context,
    packages,
    root,
  }
}

export const getDependencies: (
  pkg: ExtraPackageEntry,
  topo: ExtraTopoContext,
  file?: string,
) => [string, string][] = (pkg, topo, file) =>
  (pkg.tree
    ? Object.values(topo.packages || {})
    : Object.entries(pkg.manifest.dependencies || {})
        .filter(([name, version]) => name && version.startsWith('workspace:'))
        .map(([name]) => topo.packages[name])
  )
    .filter(({ absPath }) => !file || existsSync(join(absPath, file)))
    .map(({ name, absPath }) => [name, relative(pkg.absPath, absPath)])
