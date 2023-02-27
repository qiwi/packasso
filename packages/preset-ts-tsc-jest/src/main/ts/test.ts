import { commandModule, ModuleCommand } from '@packasso/core'

import { modules } from './modules'

export const test: ModuleCommand = async (pkg, pkgs) => {
  for (const module of modules) {
    await commandModule('test', module, pkg, pkgs)
  }
}
