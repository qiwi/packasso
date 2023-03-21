import { error, log } from 'node:console'
import { argv, cwd, execArgv, exit } from 'node:process'

import minimist from 'minimist'

import { command } from './command'
import { install } from './install'
import { getRootDir } from './package'
import { purge } from './purge'

const run: (name: string) => Promise<unknown> = async (name) => {
  log(`trying to ${name}...`)
  const root = getRootDir(cwd())
  const { conditions } = minimist(execArgv)
  const development = [conditions].flat().includes('development')
  switch (name) {
    case 'index':
    case 'modules':
      throw new Error(`i can't... you can't... no one can ${name}!`)
    case 'uninstall':
      await install(root, development, true)
      break
    case 'install':
      await install(root, development, true)
      await install(root, development)
      break
    case 'purge':
      await purge(root)
      break
    default:
      await command(name, cwd())
      break
  }
  log(`seems to be a success!`)
}

export const execute = () => {
  run(argv[2])
    .then(() => {
      exit(0)
    })
    // eslint-disable-next-line unicorn/prefer-top-level-await
    .catch((e) => {
      error(e.message)
      exit(1)
    })
}
