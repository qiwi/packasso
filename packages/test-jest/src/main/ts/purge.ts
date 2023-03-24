import { ModuleCommand } from '@packasso/core'

export const purge: ModuleCommand = async () => [
  '+ rimraf coverage jest.config.* tsconfig.test.json',
]
