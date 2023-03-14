import { cwd } from 'node:process'

import { purge as execute, getRootDir } from '@packasso/core'

export const purge: () => Promise<unknown> = async () => {
  await execute(getRootDir(cwd()))
}
