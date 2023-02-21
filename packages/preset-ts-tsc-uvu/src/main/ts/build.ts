import { buildModule, BuildModule } from '@packasso/core'

import { modules } from './modules'

export const build: BuildModule = async (pkg, include) => {
  for (const module of modules) {
    await buildModule(module, pkg, include)
  }
}
