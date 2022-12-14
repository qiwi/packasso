import { Executor } from '@packasso/core'

export const executor: Executor = async ({ copyText, copyJson }) => {
  copyText('.gitignore')
  copyJson('package.json')
}
