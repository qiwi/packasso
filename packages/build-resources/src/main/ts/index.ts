import { copyJson, copyText, Executor, resources } from '@qiwi/packasso'

export const executor: Executor = ({ cwd, pkg }) => {
  const res = resources(import.meta.url, pkg)
  copyText(res, cwd, '.gitignore')
  copyJson(res, cwd, 'package.json')
}
