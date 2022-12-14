import { resolve } from 'node:path'

import { getConfig } from './config'
import { Context, getContext } from './context'
import { getPackage, getWorkspaces } from './package'

export interface Executor {
  (utils: Context): unknown
}

export const execute = async (
  cwd: string,
  modules: string[],
  development?: boolean,
  root?: boolean,
) => {
  for (const module of modules) {
    const { executor } = await import(module)
    await executor(getContext(cwd, module, development, root))
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
