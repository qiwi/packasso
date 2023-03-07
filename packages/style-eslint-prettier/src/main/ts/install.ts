import { installModule, ModuleInstall } from '@packasso/core'

import { modules } from './modules'

export const install: ModuleInstall = async (
  pkg,
  root,
  development,
  uninstall,
) => {
  for (const module of modules) {
    await installModule(module, pkg, root, development, uninstall)
  }
}
