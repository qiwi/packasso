import { copyFile, copyJson, copyText, Executor } from '@packasso/core'

export const executor: Executor = ({ cwd, res }) => {
  copyJson(res, cwd, 'package.json')
  copyText(res, cwd, '.gitignore')
  copyFile(res, cwd, 'src/test/ts/index.ts')
}
