import { ModulePurge } from '@packasso/core'

export const purge: ModulePurge = async () => [
  'coverage',
  'jest.config.{js,ts,mjs,cjs}',
  'tsconfig.test.json',
]
