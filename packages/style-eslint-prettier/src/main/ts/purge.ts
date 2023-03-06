import { ModulePurge } from '@packasso/core'

export const purge: ModulePurge = async () => [
  '.eslintrc',
  '.eslintrc.*',
  'eslint.config.*',
  '.prettierrc',
  '.prettierrc.*',
  'prettier.config.*',
]
