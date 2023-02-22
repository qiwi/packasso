import { PackageType, TestModule } from '@packasso/core'

export const test: TestModule = async (pkg, included) => ({
  commands: [
    [
      pkg.type === PackageType.TREE
        ? `c8 --all -o target/coverage -r html -r text -r lcov ${included
            .map(({ relPath }) => `-n '${relPath}/src/main/{ts,js}'`)
            .join(' ')} uvu -r tsm -r earljs/uvu . '(${included
            .map(({ relPath }) => relPath)
            .join('|')})/src/test/[jt]s/.*.(spec|test).[jt]sx?' -i target`
        : `c8 --all -o target/coverage -r html -r text -r lcov -n 'src/main/{ts,js}' uvu -r tsm -r earljs/uvu . 'src/test/[jt]s/.*.(spec|test).[jt]sx?' -i target`,
    ],
  ],
})
