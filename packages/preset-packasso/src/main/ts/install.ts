import { installModule, InstallModule } from '@packasso/core'

import { modules } from './modules'

export const install: InstallModule = async (
  pkg,
  root,
  development,
  uninstall,
) => {
  for (const module of modules) {
    await installModule(module, pkg, root, development, uninstall)
  }
}
