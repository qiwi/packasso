import { ModuleCommand, PackageType } from '@packasso/core'

export const test: ModuleCommand = async (pkg, pkgs) => ({
  commands: [
    pkg.type === PackageType.TREE
      ? {
          command: `c8 --all -o target/coverage -r html -r text -r lcov -n '{${pkgs
            .map(({ relPath }) => relPath)
            .join(',')}}/src/main/{ts,js}' uvu -r tsm -r earljs/uvu . '(${pkgs
            .map(({ relPath }) => relPath)
            .join('|')})/src/test/[jt]s/.*.(spec|test).[jt]sx?' -i target`,
          cwd: pkg.absPath,
        }
      : `c8 --all -o target/coverage -r html -r text -r lcov -n 'src/main/{ts,js}' uvu -r tsm -r earljs/uvu . 'src/test/[jt]s/.*.(spec|test).[jt]sx?' -i target`,
  ],
})
