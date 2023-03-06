import { rmGlob } from './copy'
import { loadModule } from './module'
import { ExtraPackageEntry, getExtraTopo } from './topo'

export const purge: (root: string) => Promise<unknown> = async (root) => {
  const topo = await getExtraTopo({
    cwd: root,
  })
  for (const name of topo.queue) {
    await purgePackage(topo.packages[name])
  }
  await purgePackage(topo.root)
}

export const purgePackage = async (
  pkg: ExtraPackageEntry,
  modules: string[] = pkg.modules,
) => {
  for (const module of modules) {
    await purgeModule(module, pkg)
  }
}

export const purgeModule = async (module: string, pkg: ExtraPackageEntry) => {
  const { purge } = await loadModule(module)
  if (!purge) {
    return
  }
  const result = await purge(pkg)
  if (!result) {
    return
  }
  result.forEach((pattern) => {
    rmGlob(pkg.absPath, pattern)
  })
}
