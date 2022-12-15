import { Executor } from '@packasso/core'

export const executor: Executor = async ({ copyJson, copyText }) => {
  copyJson('package.json')
  copyText('.gitignore')
  copyText('src/test/ts/index.ts')
}
