import { copyJson, Executor } from '@qiwi/packasso'

export const executor: Executor = ({ cwd, res }) => {
  copyJson(res, cwd, 'package.json')
}
