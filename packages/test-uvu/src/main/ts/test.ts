import { argv } from 'node:process'

import { ModuleCommand, PackageType } from '@packasso/core'
import minimist from 'minimist'

export const test: ModuleCommand = async (pkg, pkgs) => {
  const paths = pkgs.map(({ relPath }) => relPath)
  const mainPaths = pkg.type === PackageType.TREE ? `{${paths.join(',')}}/` : ''
  const testPaths = pkg.type === PackageType.TREE ? `(${paths.join('|')})/` : ''
  const u = minimist(argv).u ? 'UPDATE_SNAPSHOTS=true' : ''
  return [
    `! ${u} c8 --all -o target/coverage -r html -r text -r lcov -n '${mainPaths}src/main/{ts,js}' uvu -r tsm -r earljs/uvu . '${testPaths}src/test/[jt]s/.*.(spec|test).[jt]sx?'`,
  ]
}
