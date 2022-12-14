import { Executor } from '@packasso/core'

export const executor: Executor = ({ copyText, copyJson }) => {
  copyText('.gitignore')
  copyJson('package.json')
}
