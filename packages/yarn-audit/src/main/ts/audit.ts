import { argv } from 'node:process'

import { ModuleCommand } from '@packasso/core'
import minimist from 'minimist'

export const audit: ModuleCommand = async () => [
  minimist(argv).fix
    ? '! yarn-audit-fix --audit-level moderate'
    : '! yarn npm audit --recursive --all --severity moderate',
]
