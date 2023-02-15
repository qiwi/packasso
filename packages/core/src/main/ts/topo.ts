import {
  IPackageEntry,
  ITopoContext,
  ITopoOptions,
  topo,
} from '@semrel-extra/topo'

import { Config, getConfig, mergeConfigs } from './config'

interface ExtraPackageEntry extends IPackageEntry {
  config: Config
}

interface ExtraTopoContext extends ITopoContext {
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
          config: await getConfig(pkg.absPath),
        },
      ]),
    ),
  )
  const configs = Object.values(packages).map(({ config }) => config)
  const root = {
    ...context.root,
    config:
      configs.length > 0
        ? mergeConfigs(configs)
        : await getConfig(context.root.absPath),
  }
  return {
    ...context,
    packages,
    root,
  }
}
