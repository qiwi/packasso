import { ModuleCommand } from '@packasso/core'

export const purge: ModuleCommand = async () => [
  '+ rimraf .gitignore tsconfig.json',
]
