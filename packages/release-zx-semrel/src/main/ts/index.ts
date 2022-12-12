import { copyJson, Executor } from '@packasso/core'

export const executor: Executor = ({ cwd, res }) => {
  copyJson(res, cwd, 'package.json')
}
