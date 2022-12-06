import { copyFile, copyJson, copyText, Executor, resources } from 'packasso'

export const executor: Executor = ({ cwd, pkg }) => {
  const res = resources(import.meta.url, pkg)
  copyJson(res, cwd, 'package.json')
  copyText(res, cwd, '.gitignore')
  copyFile(res, cwd, 'src/test/ts/index.ts')
}
