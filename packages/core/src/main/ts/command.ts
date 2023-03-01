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
  if (!result?.commands) {
    return
  }
  for (const commands of result.commands) {
    await concurrently(concurrentlyCommands(commands, pkg, pkgs), {
      prefixColors: ['auto'],
    }).result
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

export type Command = 'build' | 'test' | 'lint' | 'format'

export const command: (
  command: Command,
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
  command: Command,
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
  command: Command,
  module: string,
  pkg: ExtraPackageEntry,
  pkgs: ExtraPackageEntry[],
) => {
  const m = await loadModule(module)
  const c = m[command]
  if (!c) {
    return
  }
  await concurrentlyResult(await c(pkg, pkgs), pkg, pkgs)
}
