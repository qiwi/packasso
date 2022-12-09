import { copyJson, Executor, resources } from '@qiwi/packasso'

export const executor: Executor = ({ cwd, pkg }) => {
  const res = resources(import.meta.url, pkg)
  copyJson(res, cwd, 'package.json')
}
