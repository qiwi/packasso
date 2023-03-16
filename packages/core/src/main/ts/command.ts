import concurrently, { ConcurrentlyCommandInput } from 'concurrently'

import { loadModule, ModuleCommandResult } from './module'
import { getRootDir } from './package'
import {
  ExtraPackageEntry,
  ExtraTopoContext,
  getExtraTopo,
  PackageType,
} from './topo'

export const concurrentlyResult = async (
  result: ModuleCommandResult | void,
  pkg: ExtraPackageEntry,
  pkgs: ExtraPackageEntry[],
) => {
  if (!result) {
    return
  }
  for (const commands of result) {
    const cmds = concurrentlyCommands(commands, pkg, pkgs)
    try {
      await concurrently(cmds, {
        prefixColors: ['auto'],
      }).result
    } catch {
      throw new Error('ooops...')
    }
  }
}

export const concurrentlyCommands = (
  commands: ConcurrentlyCommandInput | ConcurrentlyCommandInput[],
  pkg: ExtraPackageEntry,
  pkgs: ExtraPackageEntry[],
) =>
  [commands]
    .flat()
    .flatMap((command) =>
      typeof command === 'string'
        ? {
            command,
          }
        : command,
    )
    .flatMap((command) =>
      command.command.startsWith('!')
        ? {
            ...command,
            command: command.command.slice(1).trim(),
            cwd: pkg.absPath,
          }
        : command,
    )
    .flatMap((command) =>
      (command.cwd ? [pkg] : pkg.type === PackageType.TREE ? pkgs : [pkg]).map(
        (pkg) => ({
          ...command,
          name: command.name ?? pkg.name,
          cwd: command.cwd ?? pkg.absPath,
        }),
      ),
    )

export const command: (
  command: string,
  cwd: string,
) => Promise<unknown> = async (command, cwd) => {
  const root = getRootDir(cwd)
  const topo = await getExtraTopo({
    cwd: root,
  })
  await commandPackage(
    command,
    Object.values(topo.packages).find(({ absPath }) => absPath === cwd) ||
      topo.root,
    topo,
  )
}

export const commandPackage = async (
  command: string,
  pkg: ExtraPackageEntry,
  topo: ExtraTopoContext,
) => {
  for (const module of pkg.modules) {
    await commandModule(
      command,
      module,
      pkg,
      pkg === topo.root
        ? Object.values(topo.packages).filter(({ modules }) =>
            modules.includes(module),
          )
        : [],
    )
  }
}

export const commandModule = async (
  command: string,
  module: string,
  pkg: ExtraPackageEntry,
  pkgs: ExtraPackageEntry[],
) => {
  const { modules, commands } = await loadModule(module)
  if (modules) {
    for (const module of modules) {
      await commandModule(command, module, pkg, pkgs)
    }
  }
  if (commands[command]) {
    await concurrentlyResult(await commands[command](pkg, pkgs), pkg, pkgs)
  }
}
