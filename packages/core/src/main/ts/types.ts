import { IPackageEntry, ITopoContext } from '@semrel-extra/topo'
import { ParsedArgs } from 'minimist'
import { NormalizedPackageJson } from 'read-pkg'

export type Command = (context: Context) => Promise<unknown>

export type Commands = Record<string, Command>

export type Module = {
  manifest: NormalizedPackageJson
  commands: Commands
  modules: string[]
}

export interface Context {
  cwd: string
  root: string
  development: boolean
  pkg: ExtraPackageEntry
  pkgs: ExtraPackageEntry[]
  topo: ExtraTopoContext
  module: Module
  command: string
  args: ParsedArgs
}

export type InstallData = Partial<Record<string, string | object>>[]

export type ContextInstallData = (context: Context) => InstallData

export interface ExtraPackageEntry extends IPackageEntry {
  modules: string[]
  leaf: boolean
  unit: boolean
  tree: boolean
}

export interface ExtraTopoContext extends ITopoContext {
  packages: Record<string, ExtraPackageEntry>
  root: ExtraPackageEntry
}
