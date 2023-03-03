import { ModulePurge } from '@packasso/core'

export const purge: ModulePurge = async () => [
  'build',
  'dist',
  'lib',
  'buildcache',
  '.buildcache',
  'tsconfig.{cjs,esm,es5,es6,mjs,esnext,build}.json',
]
