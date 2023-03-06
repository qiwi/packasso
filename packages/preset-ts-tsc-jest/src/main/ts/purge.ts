import { ModulePurge, purgePackage } from '@packasso/core'

import { modules } from './modules'

export const purge: ModulePurge = async (pkg) => {
  await purgePackage(pkg, modules)
}
