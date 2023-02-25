#!/usr/bin/env node
import { error, log } from 'node:console'
import { argv, exit } from 'node:process'

import { execute as build } from './build'
import { execute as install } from './install'
import { execute as test } from './test'
import { execute as uninstall } from './uninstall'

const commands = { install, uninstall, build, test }

type Command = keyof typeof commands

const execute: (command: Command) => Promise<unknown> = async (command) => {
  if (!commands[command]) {
    throw `i can't... you can't... no one can ${command}!`
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
  .catch((e: Error) => {
    error(e)
    exit(1)
  })
