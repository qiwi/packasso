import { ModulePurge } from '@packasso/core'

export const purge: ModulePurge = async () => [
  '.releaserc',
  '.releaserc.*',
  'release.config.*',
]
