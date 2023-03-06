import { ModulePurge } from '@packasso/core'

export const purge: ModulePurge = async () => [
  'coverage',
  'jest.config.*',
  'tsconfig.test.json',
]
