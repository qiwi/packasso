import { cwd, execArgv } from 'node:process'

import { install as execute, getRootDir } from '@packasso/core'
import minimist from 'minimist'

const { conditions } = minimist(execArgv)

export const install: () => Promise<unknown> = async () => {
  const root = getRootDir(cwd())
  const development = [conditions].flat().includes('development')
  await execute(root, development, true)
  await execute(root, development)
}
