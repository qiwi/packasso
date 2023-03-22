import { ModuleCommand } from '@packasso/core'

export const purge: ModuleCommand = async (pkg, pkgs) => [
  '+ rimraf build dist lib buildcache .buildcache .swcrc swc.*.json tsconfig.*.json',
]
