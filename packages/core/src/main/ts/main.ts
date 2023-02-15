import { join } from 'node:path'

import { copy } from 'globby-cp'

import { execute } from './execute'
import { getExtraTopo } from './topo'

export const main = async ({
  cwd,
  tmp,
  development,
}: {
  cwd: string
  tmp: string
  development: boolean
}) => {
  const { root, queue, packages } = await getExtraTopo({
    cwd,
  })
  await copy({
    from: join(root.absPath, 'package.json'),
    to: tmp,
  })
  for (const name of queue) {
    await copy({
      from: join(packages[name].absPath, 'package.json'),
      to: tmp,
    })
  }
  for (const name of queue) {
    await execute(
      packages[name].relPath,
      cwd,
      tmp,
      development,
      packages[name].config,
    )
  }
  await execute('.', cwd, tmp, development, root.config)
  await copy({
    from: tmp,
    to: cwd,
  })
}
