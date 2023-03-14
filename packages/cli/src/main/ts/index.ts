#!/usr/bin/env node
import { error, log } from 'node:console'
import { argv, exit } from 'node:process'

import { build } from './build'
import { format } from './format'
import { install } from './install'
import { lint } from './lint'
import { purge } from './purge'
import { release } from './release'
import { test } from './test'
import { uninstall } from './uninstall'

const commands = {
  install,
  uninstall,
  purge,
  build,
  test,
  lint,
  format,
  release,
}

type Command = keyof typeof commands

const execute: (command: Command) => Promise<unknown> = async (command) => {
  if (!commands[command]) {
    error(`i can't... you can't... no one can ${command}!`)
    exit(1)
  }
  log(`trying to ${command}...`)
  await commands[command]()
  log(`seems to be a success!`)
}

execute(argv[2] as Command)
  .then(() => {
    exit(0)
  })
  // eslint-disable-next-line unicorn/prefer-top-level-await
  .catch(() => {
    exit(1)
  })
