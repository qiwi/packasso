import { ModuleCommand } from '@packasso/core'

export const build: ModuleCommand = async () => [
  'rimraf target/resources',
  'globby-cp src/main/resources target/resources',
]
