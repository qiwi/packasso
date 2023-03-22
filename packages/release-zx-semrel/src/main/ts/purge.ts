import { ModuleCommand } from '@packasso/core'

export const purge: ModuleCommand = async () => [
  '+ rimraf .releaserc .releaserc.* release.config.*',
]
