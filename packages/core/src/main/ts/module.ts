import { resolve } from 'node:path'

import { ConcurrentlyCommandInput } from 'concurrently'
import { readPackageSync } from 'read-pkg'

import { ExtraPackageEntry } from './topo'

export interface ModuleInstallResource {
  path: string
  data: string | object
}

export interface ModuleInstallResult {
  resources?: ModuleInstallResource[]
  remove?: string[]
}

export interface ModuleInstall {
  (
    pkg: ExtraPackageEntry,
    root: string,
    development: boolean,
    uninstall: boolean,
  ): Promise<ModuleInstallResult | void>
}

export interface ModuleCommandResult {
  commands?: (ConcurrentlyCommandInput | ConcurrentlyCommandInput[])[]
}

export interface ModuleCommand {
  (
    pkg: ExtraPackageEntry,
    pkgs: ExtraPackageEntry[],
  ): Promise<ModuleCommandResult | void>
}

export interface Module {
  install?: ModuleInstall
  build?: ModuleCommand
  test?: ModuleCommand
  lint?: ModuleCommand
  format?: ModuleCommand
}

export const loadModule: (name: string) => Promise<Module> = async (name) => {
  const module: Module = await import(name)
  return module
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

export const getModuleVersion: (module: string, root: string) => string = (
  module,
  root,
) => readPackageSync({ cwd: resolve(root, 'node_modules', module) }).version
