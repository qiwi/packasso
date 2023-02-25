import { testModule, TestModule } from '@packasso/core'

import { modules } from './modules'

export const test: TestModule = async (pkg, included) => {
  for (const module of modules) {
    await testModule(module, pkg, included)
  }
}
