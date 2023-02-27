import { commandModule, ModuleCommand } from '@packasso/core'

import { modules } from './modules'

export const build: ModuleCommand = async (pkg, pkgs) => {
  for (const module of modules) {
    await commandModule('build', module, pkg, pkgs)
  }
}
