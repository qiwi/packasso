import { cwd, execArgv } from 'node:process'

import { getRootDir, install } from '@packasso/core'
import minimist from 'minimist'

const { conditions } = minimist(execArgv)

export const execute: () => Promise<unknown> = async () => {
  const root = getRootDir(cwd())
  const source = [conditions].flat().includes('source')
  await install(root, source, true)
  await install(root, source)
}
