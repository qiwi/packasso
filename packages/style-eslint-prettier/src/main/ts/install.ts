import { ModuleInstall } from '@packasso/core'

export const install: ModuleInstall = async () => ({
  remove: [
    '.eslintrc',
    '.eslintrc.{json,yaml,yml,js,cjs}',
    'eslint.config.{json,yaml,yml,js,cjs}',
    '.prettierrc',
    '.prettierrc.{json,yaml,yml,js,cjs}',
    'prettier.config.{json,yaml,yml,js,cjs}',
  ],
})
