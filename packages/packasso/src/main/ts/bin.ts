#!/usr/bin/env node
import { cwd, execArgv, exit } from 'node:process'

import minimist from 'minimist'

import { main } from './main'

const { conditions } = minimist(execArgv)

main({
  cwd: cwd(),
  development: conditions === 'development',
})
  .then(() => {
    exit(0)
  })
  // eslint-disable-next-line unicorn/prefer-top-level-await
  .catch((e) => {
    console.error(e)
    exit(1)
  })
