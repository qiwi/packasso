#!/usr/bin/env node
import { cwd, execArgv, exit } from 'node:process'

import { getRootDir, main } from '@packasso/core'
import minimist from 'minimist'
import { temporaryDirectoryTask } from 'tempy'

const { conditions } = minimist(execArgv)

temporaryDirectoryTask((tmp) => {
  main({
    cwd: getRootDir(cwd()),
    tmp,
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
})
