import { topo } from '@semrel-extra/topo'

import { Config, getConfig, mergeConfigs } from './config'
import { execute } from './execute'
import { getPackage } from './package'

const drop = (config: Config) => ({
  ...config,
  modules: config.modules.map((module) => ({
    ...module,
    drop: true,
  })),
})

export const main = async ({
  cwd,
  development,
}: {
  cwd: string
  development: boolean
}) => {
  const root = cwd
  const pkg = getPackage(cwd)
  if (Array.isArray(pkg.workspaces)) {
    const { queue, packages } = await topo({
      workspaces: pkg.workspaces,
      cwd,
    })
    const paths = Object.fromEntries(
      Object.values(packages).map(({ name, absPath }) => [name, absPath]),
    )
    const configs = await Promise.all(
      queue.map(async (name) => await getConfig(paths[name])),
    )
    await Promise.all(
      queue.map(async (name, index) => {
        await execute(paths[name], root, development, drop(configs[index]))
        return await execute(paths[name], root, development, configs[index])
      }),
    )
    await execute(cwd, root, development, drop(mergeConfigs(configs)))
    await execute(cwd, root, development, mergeConfigs(configs))
  } else {
    await execute(cwd, root, development, drop(await getConfig(cwd)))
    await execute(cwd, root, development, await getConfig(cwd))
  }
}
