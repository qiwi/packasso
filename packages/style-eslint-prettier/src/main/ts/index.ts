import { Executor } from '@packasso/core'

export const executor: Executor = async ({ dropPath, copyJson }) => {
  dropPath([
    '.eslintrc',
    '.eslintrc.{json,yaml,yml,js,cjs}',
    'eslint.config.{json,yaml,yml,js,cjs}',
  ])
  dropPath([
    '.prettierrc',
    '.prettierrc.{json,yaml,yml,js,cjs}',
    'prettier.config.{json,yaml,yml,js,cjs}',
  ])
  copyJson('package.json')
}
