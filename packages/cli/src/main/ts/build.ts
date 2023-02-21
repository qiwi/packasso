import { cwd } from 'node:process'

import { build } from '@packasso/core'

export const execute: () => Promise<unknown> = async () => {
  await build(cwd())
}
