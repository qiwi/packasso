#!/usr/bin/env node
import {
  cmd,
  createCommandClean,
  createCommandInstall,
  createCommandPurge,
  createCommandTest,
  execute,
  getTopo,
  Install,
  program,
  testCoverageDir,
  testSuffixes,
  testTypes,
} from '@packasso/core'
import fg from 'fast-glob'
import { findUpSync } from 'find-up'

const tsConfigTest = 'tsconfig.node-test.json'

const install: Install = {
  data: (pkg) => [
    pkg.tree
      ? {
          [tsConfigTest]: {
            compilerOptions: {
              experimentalDecorators: true,
            },
          },
        }
      : {},
  ],
}

program(
  createCommandInstall(install),
  createCommandClean([
    `${testCoverageDir}-unit-node`,
    `${testCoverageDir}-it-node`,
    `${testCoverageDir}-e2e-node`,
  ]),
  createCommandPurge(['tsconfig.test.json']),
  createCommandTest().action(async (options) => {
    const { cwd, preset, index, unit, it, e2e } = options
    const { root, queuePackages } = await getTopo({ cwd }, preset)
    await execute(
      testTypes(unit, it, e2e).map((type) => (cwd) => {
        const files = fg.globSync(
          `src/test/{ts,js}/**/*.${
            testSuffixes[type].length > 1 ? '{' : ''
          }${testSuffixes[type].join(',')}${
            testSuffixes[type].length > 1 ? '}' : ''
          }${index ? '.node' : ''}.{ts,js,tsx,jsx}`,
          { cwd },
        )
        return cmd('c8', {
          all: true,
          o: `${testCoverageDir}-${type}-node`,
          r: ['json', 'lcov'],
          n: "'src/main/{ts,js}'",
          _:
            files.length > 0
              ? cmd('tsx', {
                  tsconfig: findUpSync(tsConfigTest, { cwd }),
                  test: true,
                  _: files,
                })
              : "echo 'no tests found'",
        })
      }),
      root.tree ? queuePackages : preset ? root.absPath : root,
    )
  }),
)
