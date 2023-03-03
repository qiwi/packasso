import { ModulePurge } from '@packasso/core'

export const purge: ModulePurge = async () => [
  '.releaserc',
  '.releaserc.{json,yaml,yml,js,cjs}',
  'release.config.{json,yaml,yml,js,cjs}',
]
