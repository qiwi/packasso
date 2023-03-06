import { ModulePurge } from '@packasso/core'

export const purge: ModulePurge = async () => [
  'build',
  'dist',
  'lib',
  'buildcache',
  '.buildcache',
  '.swcrc',
  'swc.*.json',
  'tsconfig.*.json',
]
