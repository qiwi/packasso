import { resolve } from 'node:path'

import { InstallModule } from './install'

export interface Module {
  install?: InstallModule
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
