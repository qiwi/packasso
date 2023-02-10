import { topo } from '@semrel-extra/topo'
import { copy } from 'globby-cp'

import { getConfig, mergeConfigs } from './config'
import { execute } from './execute'
import { getPackage } from './package'

export const main = async ({
  cwd,
  tmp,
  development,
}: {
  cwd: string
  tmp: string
  development: boolean
}) => {
  const pkg = getPackage(cwd)
  await copy({
    from: 'package.json',
    to: tmp,
  })
  if (Array.isArray(pkg.workspaces)) {
    await Promise.all(
      pkg.workspaces.map(
        async (workspace) =>
          await copy({
            from: `${cwd}/${workspace}/package.json`,
            to: tmp,
          }),
      ),
    )
    const { queue, packages } = await topo({
      workspaces: pkg.workspaces,
      cwd: tmp,
    })
    const paths = Object.fromEntries(
      Object.values(packages).map(({ name, relPath }) => [name, relPath]),
    )
    const configs = await Promise.all(
      queue.map(async (name) => await getConfig(paths[name])),
    )
    await Promise.all(
      queue.map(
        async (name, index) =>
          await execute(paths[name], cwd, tmp, development, configs[index]),
      ),
    )
    await execute('.', cwd, tmp, development, mergeConfigs(configs))
  } else {
    await execute('.', cwd, tmp, development, await getConfig(cwd))
  }
  await copy({
    from: tmp,
    to: cwd,
  })
}
