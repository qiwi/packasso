import {
  IPackageEntry,
  ITopoContext,
  ITopoOptions,
  topo,
} from '@semrel-extra/topo'
import { isEqual, uniqWith } from 'lodash-es'

import { getConfig } from './config'

export enum PackageType {
  UNIT = 'unit',
  LEAF = 'leaf',
  TREE = 'tree',
}

export interface ExtraPackageEntry extends IPackageEntry {
  modules: string[]
  type: PackageType
}

export interface ExtraTopoContext extends ITopoContext {
  packages: Record<string, ExtraPackageEntry>
  root: ExtraPackageEntry
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
          type: PackageType.LEAF,
          modules: await getConfig(pkg.absPath),
        },
      ]),
    ),
  )
  const root = {
    ...context.root,
    relPath: '.',
    type: context.root.manifest.workspaces
      ? PackageType.TREE
      : PackageType.UNIT,
    modules: uniqWith(
      [
        ...Object.values(packages).flatMap(({ modules }) => modules),
        ...(await getConfig(context.root.absPath)),
      ],
      isEqual,
    ),
  }
  return {
    ...context,
    packages,
    root,
  }
}
