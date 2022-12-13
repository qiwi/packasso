import { resolve } from 'node:path'

import { getConfig } from './config'
import { getResourcesDir } from './copy'
import { getPackage, getWorkspaces, PackageJson } from './package'

export interface ExecutorArgs {
  cwd: string
  res: string
  pkg: Required<PackageJson>
  development?: boolean
  root?: boolean
}

export interface Executor {
  (args: ExecutorArgs): unknown
}

export const execute = async (
  cwd: string,
  modules: string[],
  development?: boolean,
  root?: boolean,
) => {
  for (const module of modules) {
    const pkg = getPackage(cwd)
    const res = getResourcesDir(cwd, module, development, root)
    const { executor } = await import(module)
    await executor({ cwd, res, pkg, development, root })
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
        async (workspace) =>
          await execute(workspace, await getConfig(workspace), development),
      ),
    )
    const awaitModules = await Promise.all(
      workspaces.map(async (workspace) => await getConfig(workspace)),
    )
    const modules = awaitModules
      .flat()
      .filter((config, index, configs) => configs.indexOf(config) === index)
    await execute(cwd, modules, development, true)
    await execute(cwd, modules, development)
  } else {
    const modules = await getConfig(cwd)
    await execute(cwd, modules, development, true)
    await execute(cwd, modules, development)
  }
}
