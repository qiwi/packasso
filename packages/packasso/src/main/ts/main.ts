import { resolve } from 'node:path'

import { getConfig } from './config'
import { getPackage, getWorkspaces, PackageJson } from './package'

export interface Executor {
  ({ cwd, pkg }: { cwd: string; pkg: Required<PackageJson> }): unknown
}

export const execute = async (cwd: string, modules: string[]) => {
  for (const module of modules) {
    const { executor } = await import(module)
    await executor({ cwd, pkg: getPackage(cwd) })
  }
}

export const main = async ({ cwd }: { cwd: string }) => {
  const pkg = getPackage(cwd)
  if (pkg.workspaces) {
    const workspaces = Object.values(getWorkspaces(cwd, pkg)).map((workspace) =>
      resolve(cwd, workspace),
    )
    await Promise.all(
      workspaces.map(async (workspace) => await main({ cwd: workspace })),
    )
    const modules = await Promise.all(
      workspaces.map(async (workspace) => await getConfig(workspace)),
    )
    await execute(
      cwd,
      modules
        .flat()
        .filter((config, index, configs) => configs.indexOf(config) === index),
    )
  } else {
    await execute(cwd, await getConfig(cwd))
  }
}
