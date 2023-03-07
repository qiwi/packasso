import { commandModule, ModuleCommand } from '@packasso/core'

import { modules } from './modules'

export const lint: ModuleCommand = async (pkg, pkgs) => {
  for (const module of modules) {
    await commandModule('lint', module, pkg, pkgs)
  }
}
