#!/usr/bin/env node
import { dirname } from 'node:path'
import { cwd, execArgv, exit } from 'node:process'

import { getModulesDir, main } from '@packasso/core'
import minimist from 'minimist'

const { conditions } = minimist(execArgv)

main({
  cwd: dirname(getModulesDir(cwd())),
  development: conditions === 'development',
})
  .then(() => {
    exit(0)
  })
  // eslint-disable-next-line unicorn/prefer-top-level-await
  .catch((e: Error) => {
    console.error(e)
    exit(1)
  })
