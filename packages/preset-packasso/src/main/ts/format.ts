import { commandModule, ModuleCommand } from '@packasso/core'

import { modules } from './modules'

export const format: ModuleCommand = async (pkg, pkgs) => {
  for (const module of modules) {
    await commandModule('format', module, pkg, pkgs)
  }
}
