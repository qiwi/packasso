import { IPackageEntry, ITopoContext } from '@semrel-extra/topo'

export type Install = {
  data?:
    | InstallData
    | ((pkg: ExtraPackageEntry, topo: ExtraTopoContext) => InstallData)
  deps?: string[]
}

export type InstallData = Partial<Record<string, string | object>>[]

export interface ExtraPackageEntry extends IPackageEntry {
  modules: string[]
  leaf: boolean
  unit: boolean
  tree: boolean
}

export interface ExtraTopoContext extends ITopoContext {
  packages: Record<string, ExtraPackageEntry>
  queuePackages: ExtraPackageEntry[]
  root: ExtraPackageEntry
}
