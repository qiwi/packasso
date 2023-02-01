import { Executor } from '@packasso/core'

export const executor: Executor = async ({ copyJson, dropPath }) => {
  dropPath([
    '.releaserc',
    '.releaserc.{json,yaml,yml,js,cjs}',
    'release.config.{json,yaml,yml,js,cjs}',
  ])
  copyJson('package.json')
}
