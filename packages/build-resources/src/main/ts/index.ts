import { copyJson, copyText, Executor } from '@packasso/core'

export const executor: Executor = ({ cwd, res }) => {
  copyText(res, cwd, '.gitignore')
  copyJson(res, cwd, 'package.json')
}
