import { join, resolve } from 'node:path'

import { getConfig } from './config'
import { resources } from './copy'
import {
  getModulesDir,
  getPackage,
  getWorkspaces,
  PackageJson,
} from './package'

export interface ExecutorArgs {
  cwd: string
  res: string
  pkg: Required<PackageJson>
  development?: boolean
}

export interface Executor {
  (args: ExecutorArgs): unknown
}

export const execute = async (
  cwd: string,
  modules: string[],
  development?: boolean,
) => {
  const dir = getModulesDir(cwd)
  for (const module of modules) {
    const pkg = getPackage(cwd)
    const res = resources(join(dir, module), pkg, development)
    const { executor } = await import(module)
    await executor({ cwd, res, pkg, development })
  }
}

export const main = async ({
  cwd,
  development,
}: {
  cwd: string
  development: boolean
}) => {
  const pkg = getPackage(cwd)
  if (pkg.workspaces) {
    const workspaces = Object.values(getWorkspaces(cwd, pkg)).map((workspace) =>
      resolve(cwd, workspace),
    )
    await Promise.all(
      workspaces.map(
        async (workspace) => await main({ cwd: workspace, development }),
      ),
    )
    const modules = await Promise.all(
      workspaces.map(async (workspace) => await getConfig(workspace)),
    )
    await execute(
      cwd,
      modules
        .flat()
        .filter((config, index, configs) => configs.indexOf(config) === index),
      development,
    )
  } else {
    await execute(cwd, await getConfig(cwd), development)
  }
}
