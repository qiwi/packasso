import { argv } from 'node:process'

import { ModuleCommand } from '@packasso/core'
import minimist from 'minimist'

export const test: ModuleCommand = async () => [
  `! jest --silent ${minimist(argv).u ? '-u' : ''}`,
]
