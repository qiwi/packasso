import { ModulePurge } from '@packasso/core'

export const purge: ModulePurge = async () => [
  'build',
  'dist',
  'lib',
  'buildcache',
  '.buildcache',
  '.swcrc',
  'swc.{cjs,mjs,es5,es6}.json',
  'tsconfig.{cjs,esm,es5,es6,mjs,esnext,build}.json',
]
