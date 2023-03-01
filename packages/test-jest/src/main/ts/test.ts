import { ModuleCommand } from '@packasso/core'

export const test: ModuleCommand = async () => ({
  commands: ['! jest'],
})
