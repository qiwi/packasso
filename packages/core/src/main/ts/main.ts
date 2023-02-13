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
    const configs = []
    for (const name of queue) {
      const config = await getConfig(packages[name].relPath)
      await execute(packages[name].relPath, cwd, tmp, development, config)
      configs.push(config)
    }
    await execute('.', cwd, tmp, development, mergeConfigs(configs))
  } else {
    await execute('.', cwd, tmp, development, await getConfig(cwd))
  }
  await copy({
    from: tmp,
    to: cwd,
  })
}
