import { ModulePurge } from '@packasso/core'

export const purge: ModulePurge = async () => [
  '.eslintrc',
  '.eslintrc.{json,yaml,yml,js,cjs}',
  'eslint.config.{json,yaml,yml,js,cjs}',
  '.prettierrc',
  '.prettierrc.{json,yaml,yml,js,cjs}',
  'prettier.config.{json,yaml,yml,js,cjs}',
]
