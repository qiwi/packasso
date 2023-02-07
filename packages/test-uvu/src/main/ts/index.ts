import { Executor } from '@packasso/core'

export const executor: Executor = async ({ dropPath, copyJson }) => {
  dropPath('coverage')
  copyJson('package.json')
}
