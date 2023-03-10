import { ModuleCommand } from '@packasso/core'

export const build: ModuleCommand = async () => [
  'rimraf target/docs',
  'typedoc --skipErrorChecking --logLevel Error',
]
