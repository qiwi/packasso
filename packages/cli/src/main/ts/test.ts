import { cwd } from 'node:process'

import { test } from '@packasso/core'

export const execute: () => Promise<unknown> = async () => {
  await test(cwd())
}
