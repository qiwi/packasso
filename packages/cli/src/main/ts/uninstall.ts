import { cwd, execArgv } from 'node:process'

import { getRootDir, install } from '@packasso/core'
import minimist from 'minimist'

const { conditions } = minimist(execArgv)

export const execute: () => Promise<unknown> = async () =>
  await install(
    getRootDir(cwd()),
    [conditions].flat().includes('development'),
    true,
  )
