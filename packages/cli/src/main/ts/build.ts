import { cwd } from 'node:process'

import { command } from '@packasso/core'

export const build: () => Promise<unknown> = async () => {
  await command('build', cwd())
}
