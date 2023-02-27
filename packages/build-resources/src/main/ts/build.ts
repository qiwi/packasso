import { ModuleCommand } from '@packasso/core'

export const build: ModuleCommand = async () => ({
  commands: [
    'rimraf target/resources',
    'globby-cp src/main/resources target/resources',
  ],
})
