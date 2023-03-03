import { ModulePurge } from '@packasso/core'

export const purge: ModulePurge = async () => [
  'build',
  'dist',
  'lib',
  '.swcrc',
  'swc.{cjs,mjs,es5,es6}.json',
  'tsconfig.build.json',
]
