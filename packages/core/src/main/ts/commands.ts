import { cwd, env, exit } from 'node:process'

import * as commander from '@commander-js/extra-typings'
import lodash from 'lodash'

import { getPackageJson } from './helpers'
import { installData, installDeps } from './install'
import { cmd, execute, run } from './run'
import { getTopo } from './topo'
import { Install } from './types'

export const createArgument = commander.createArgument
export const createOption = commander.createOption

export const createOptionCwd = () =>
  createOption('--cwd <cwd>', 'working directory')
    .default(cwd())
    .argParser<string>(String)
    .makeOptionMandatory(true)

export const createOptionPreset = () =>
  createOption('--preset <preset>', 'root preset')
    .default(getPackageJson().name)
    .argParser<string>(String)
    .makeOptionMandatory(false)

export const createOptionIndex = () =>
  createOption('--index <number>', 'preset index')
    .default(0)
    .argParser<number>(Number.parseInt)
    .makeOptionMandatory(false)

export const createCommandInstall = (
  install: Install,
  modules: string[] = [],
) => [
  createCommand('install', 'install').action(async (options, context) => {
    const { cwd, preset } = options
    const topo = await getTopo({ cwd }, preset)
    const pkgs = [...topo.queuePackages, topo.root]
    await run(cwd, modules, 'install', preset, context)
    const { data = [], deps = [] } = install
    for (const pkg of pkgs) {
      if (!env.CI) {
        await installData(
          lodash.isFunction(data) ? data(pkg, topo) : data,
          pkg.absPath,
          false,
        )
      }
      if (!pkg.leaf) {
        await installDeps(deps, pkg.absPath, false)
      }
    }
  }),
  createCommand('uninstall', 'uninstall').action(async (options, context) => {
    const { cwd, preset } = options
    const topo = await getTopo({ cwd }, preset)
    const pkgs = [...topo.queuePackages, topo.root]
    const { data = [], deps = [] } = install
    for (const pkg of pkgs.reverse()) {
      await installData(
        lodash.isFunction(data) ? data(pkg, topo) : data,
        pkg.absPath,
        true,
      )
      if (!pkg.leaf) {
        await installDeps([deps].flat(), pkg.absPath, true)
      }
    }
    await run(cwd, modules.reverse(), 'uninstall', preset, context)
  }),
]

export const createCommandRimraf = (
  name: string,
  description: string,
  files: string[],
  modules: string[] = [],
) =>
  createCommand(name, description).action(async (options, context) => {
    const { cwd, preset } = options
    const { root, queuePackages } = await getTopo({ cwd }, preset)
    await execute(cmd('rimraf', { _: files.flat() }), [root, ...queuePackages])
    await run(cwd, modules, name, preset, context)
  })

export const createCommandClean = (files: string[], modules: string[] = []) =>
  createCommandRimraf('clean', 'clean target', files, modules)

export const createCommandPurge = (files: string[], modules: string[] = []) =>
  createCommandRimraf('purge', 'purge configs', files, modules)

export const createCommandTest = () =>
  createCommand('test', 'test')
    .addOption(createOption('--unit', 'unit tests'))
    .addOption(createOption('--it', 'integration tests'))
    .addOption(createOption('--e2e', 'end-to-end tests'))
    .addOption(createOption('-u', 'update snapshots and screenshots'))

export const createCommandModules = (modules: Record<string, string[]>) =>
  Object.keys(modules).map((command) =>
    createCommand(command, command).action(async (options, context) => {
      const { cwd, preset } = options
      await run(cwd, modules[command], command, preset, context)
    }),
  )

export const createCommand = (name: string, description: string) =>
  commander
    .createCommand(name)
    .description(description)
    .allowUnknownOption()
    .addOption(createOptionCwd())
    .addOption(createOptionPreset())
    .addOption(createOptionIndex())

export const createProgram = () => {
  const { name, description = '' } = getPackageJson()
  return commander
    .createCommand(name)
    .description(description)
    .allowUnknownOption()
}

export const program = (
  ...commands: (commander.Command | commander.Command[])[]
) => {
  const program = createProgram()
  for (const command of commands.flat()) {
    program.addCommand(command)
  }
  program
    .parseAsync()
    .then(() => exit(0))
    .catch(() => exit(1))
}
