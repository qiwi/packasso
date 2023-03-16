import { resolve } from 'node:path'

import { ConcurrentlyCommandInput } from 'concurrently'

import { ExtraPackageEntry } from './topo'

export type ModuleInstallResult = {
  path: string
  data: string | object
}[]

export interface ModuleInstall {
  (
    pkg: ExtraPackageEntry,
    root: string,
    development: boolean,
    uninstall: boolean,
  ): Promise<ModuleInstallResult | void>
}

export type ModulePurgeResult = string[]

export interface ModulePurge {
  (pkg: ExtraPackageEntry): Promise<ModulePurgeResult | void>
}

export type ModuleCommandResult = (
  | ConcurrentlyCommandInput
  | ConcurrentlyCommandInput[]
)[]

export interface ModuleCommand {
  (
    pkg: ExtraPackageEntry,
    pkgs: ExtraPackageEntry[],
  ): Promise<ModuleCommandResult | void>
}

export interface Module {
  install?: ModuleInstall
  purge?: ModulePurge
  modules: string[]
  commands: Record<string, ModuleCommand>
}

export const loadModule: (name: string) => Promise<Module> = async (name) => {
  const { install, purge, modules, ...commands } = await import(name)
  return {
    install,
    purge,
    modules,
    commands,
  }
}

export const getModuleResourcesDir: (
  module: string,
  root: string,
  development: boolean,
) => string = (module, root, development) =>
  resolve(
    root,
    'node_modules',
    module,
    ...(development ? ['src', 'main'] : ['target']),
    'resources',
  )