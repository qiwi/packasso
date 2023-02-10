import { Executor } from '@packasso/core'

export const executor: Executor = async ({ copyJson, copyText }) => {
  copyJson('package.json')
  copyText('LICENSE', {
    year: new Date().getFullYear(),
  })
}
