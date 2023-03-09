import { argv } from 'node:process'

import { ModuleCommand } from '@packasso/core'
import minimist from 'minimist'

export const test: ModuleCommand = async () => [
  `! jest ${minimist(argv).u ? '-u' : ''}`,
]
