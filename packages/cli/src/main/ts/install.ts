import { cwd, execArgv } from 'node:process'

import { getRootDir, install } from '@packasso/core'
import minimist from 'minimist'

const { conditions } = minimist(execArgv)

export const execute: () => Promise<unknown> = async () => {
  const root = getRootDir(cwd())
  const development = [conditions].flat().includes('development')
  await install(root, development, true)
  await install(root, development)
}
