import { cwd } from 'node:process'

import { command } from '@packasso/core'

export const test: () => Promise<unknown> = async () => {
  await command('test', cwd())
}
