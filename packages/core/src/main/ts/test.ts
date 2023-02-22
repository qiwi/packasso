import concurrently from 'concurrently'

import { loadModule } from './module'
import { getRootDir } from './package'
import { ExtraPackageEntry, ExtraTopoContext, getExtraTopo } from './topo'

export interface TestModuleResult {
  commands?: string[][]
}

export interface TestModule {
  (
    pkg: ExtraPackageEntry,
    included: ExtraPackageEntry[],
  ): Promise<TestModuleResult | void>
}

export const test: (cwd: string) => Promise<unknown> = async (cwd) => {
  const root = getRootDir(cwd)
  const topo = await getExtraTopo({
    cwd: root,
  })
  await testPackage(
    Object.values(topo.packages).find(({ absPath }) => absPath === cwd) ||
      topo.root,
    topo,
  )
}

export const testPackage = async (
  pkg: ExtraPackageEntry,
  topo: ExtraTopoContext,
) => {
  for (const module of pkg.modules) {
    await testModule(
      module,
      pkg,
      Object.values(topo.packages).filter(({ modules }) =>
        modules.includes(module),
      ),
    )
  }
}

export const testModule = async (
  module: string,
  pkg: ExtraPackageEntry,
  included: ExtraPackageEntry[] = [],
) => {
  const { test } = await loadModule(module)
  if (test) {
    const result = await test(pkg, included)
    if (result?.commands) {
      for (const commands of result.commands) {
        await concurrently(
          commands.map((command) => ({
            name: command.split(' ')[0],
            command,
          })),
          { cwd: pkg.absPath },
        ).result
      }
    }
  }
}
