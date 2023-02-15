#!/usr/bin/env node
import { error } from 'node:console'
import { cwd, execArgv, exit } from 'node:process'

import { getRootDir, main } from '@packasso/core'
import minimist from 'minimist'
import { temporaryDirectory } from 'tempy'

const { conditions } = minimist(execArgv)

main({
  cwd: getRootDir(cwd()),
  tmp: temporaryDirectory(),
  development: conditions === 'development',
})
  .then(() => {
    exit(0)
  })
  // eslint-disable-next-line unicorn/prefer-top-level-await
  .catch((e: Error) => {
    error(e)
    exit(1)
  })
