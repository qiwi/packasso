import { Executor } from '@packasso/core'

export const executor: Executor = async ({ copyJson }) => {
  copyJson('package.json')
}
