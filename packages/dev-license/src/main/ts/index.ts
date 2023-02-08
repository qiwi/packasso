import { Executor } from '@packasso/core'

export const executor: Executor = async ({ copyText }) => {
  copyText('LICENSE', {
    year: new Date().getFullYear(),
  })
}
