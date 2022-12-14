import { Executor } from '@packasso/core'

export const executor: Executor = ({ copyJson }) => {
  copyJson('package.json')
}
