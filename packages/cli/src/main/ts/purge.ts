import { cwd } from 'node:process'

import { getRootDir, purge } from '@packasso/core'

export const execute: () => Promise<unknown> = async () => {
  await purge(getRootDir(cwd()))
}
