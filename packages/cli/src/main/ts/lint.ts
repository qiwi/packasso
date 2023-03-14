import { cwd } from 'node:process'

import { command } from '@packasso/core'

export const lint: () => Promise<unknown> = async () => {
  await command('lint', cwd())
}
