import { cwd } from 'node:process'

import { command } from '@packasso/core'

export const release: () => Promise<unknown> = async () => {
  await command('release', cwd())
}
