import { ModulePurge } from '@packasso/core'

export const purge: ModulePurge = async () => [
  '.prettierrc',
  '.prettierrc.*',
  'prettier.config.*',
]
