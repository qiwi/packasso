import { cwd } from 'node:process'

import { command } from '@packasso/core'

export const format: () => Promise<unknown> = async () => {
  await command('format', cwd())
}
