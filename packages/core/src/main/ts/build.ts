import concurrently from 'concurrently'

import { loadModule } from './module'
import { getRootDir } from './package'
import {
  ExtraPackageEntry,
  ExtraTopoContext,
  getExtraTopo,
  PackageType,
} from './topo'

interface BuildModuleCommand {
  name?: string
  command: string
  workspaces?: boolean
}

export interface BuildModuleResult {
  commands?: (string | BuildModuleCommand)[][]
}

export interface BuildModule {
  (pkg: ExtraPackageEntry, include: string): Promise<BuildModuleResult | void>
}

export const build: (cwd: string) => Promise<unknown> = async (cwd) => {
  const root = getRootDir(cwd)
  const topo = await getExtraTopo({
    cwd: root,
  })
  await buildPackage(
    Object.values(topo.packages).find(({ absPath }) => absPath === cwd) ||
      topo.root,
    topo,
  )
}

export const buildPackage = async (
  pkg: ExtraPackageEntry,
  topo: ExtraTopoContext,
) => {
  for (const module of pkg.modules) {
    await buildModule(
      module,
      pkg,
      Object.values(topo.packages)
        .filter(({ modules }) => modules.includes(module))
        .map(({ name }) => `--include ${name}`)
        .join(' '),
    )
  }
}

export const buildModule = async (
  module: string,
  pkg: ExtraPackageEntry,
  include: string,
  // eslint-disable-next-line sonarjs/cognitive-complexity
) => {
  const { build } = await loadModule(module)
  if (build) {
    const result = await build(pkg, include)
    if (result?.commands) {
      for (const commands of result.commands) {
        await concurrently(
          commands
            .map((command) =>
              typeof command === 'string'
                ? command.startsWith('!')
                  ? {
                      command: command.slice(1).trim(),
                      workspaces: false,
                    }
                  : { command }
                : command,
            )
            .map(
              ({
                name,
                command,
                workspaces = pkg.type === PackageType.TREE,
              }) => ({
                name: name ?? command.split(' ')[0],
                command: workspaces
                  ? `yarn workspaces foreach --parallel ${include} run ${command}`
                  : command,
              }),
            ),
          { cwd: pkg.absPath },
        ).result
      }
    }
  }
}
