import { resolve } from 'node:path'

import { getConfig } from './config'
import { execute } from './execute'
import { getPackage, getWorkspaces } from './package'

export const main = async ({
  cwd,
  development,
}: {
  cwd: string
  development: boolean
}) => {
  const root = cwd
  const pkg = getPackage(cwd)
  if (pkg.workspaces) {
    const workspaces = Object.values(getWorkspaces(cwd, pkg)).map((workspace) =>
      resolve(cwd, workspace),
    )
    await Promise.all(
      workspaces.map(
        async (workspace) =>
          await execute(
            workspace,
            root,
            development,
            await getConfig(workspace),
          ),
      ),
    )
    const awaitModules = await Promise.all(
      workspaces.map(async (workspace) => await getConfig(workspace)),
    )
    const modules = awaitModules
      .flat()
      .filter((config, index, configs) => configs.indexOf(config) === index)
    await execute(cwd, root, development, modules)
  } else {
    const modules = await getConfig(cwd)
    await execute(cwd, root, development, modules)
  }
}
