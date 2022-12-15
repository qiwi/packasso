import { resolve } from 'node:path'

import { getConfig, mergeConfigs } from './config'
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
    const configs = await Promise.all(
      workspaces.map(async (workspace) => await getConfig(workspace)),
    )
    await Promise.all(
      workspaces.map(
        async (workspace, index) =>
          await execute(workspace, root, development, configs[index]),
      ),
    )
    await execute(cwd, root, development, mergeConfigs(configs))
  } else {
    await execute(cwd, root, development, await getConfig(cwd))
  }
}
