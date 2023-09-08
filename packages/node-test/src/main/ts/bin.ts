#!/usr/bin/env node
import {
  cmd,
  createCommand,
  createCommandClean,
  createCommandPurge,
  execute,
  getTopo,
  program,
  testCoverageDir,
  testCoverageMergeAndReport,
  testSuffixes,
  TestType,
} from '@packasso/core'
import fg from 'fast-glob'

const createCommandTest = (
  name: string,
  description: string,
  types: TestType[],
  suffix = false,
) =>
  createCommand(name, description).action(async (options) => {
    const { cwd, preset } = options
    const topo = await getTopo({ cwd }, preset)
    const { root, queuePackages } = topo
    await execute(
      types.map((type) => (cwd) => {
        const files = fg.globSync(
          `src/test/{ts,js}/**/*.{${testSuffixes[type].join(',')}}${
            suffix ? '.node' : ''
          }.{ts,js,tsx,jsx}`,
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
                  test: true,
                  _: files,
                })
              : "echo 'no tests found'",
        })
      }),
      root.tree ? queuePackages : preset ? root.absPath : root,
    )
    await testCoverageMergeAndReport(topo, types, 'node', preset)
  })

program(
  createCommandClean([`${testCoverageDir}-*`, testCoverageDir]),
  createCommandPurge(['coverage', 'tsconfig.test.json']),
  createCommandTest('test', 'all tests', ['unit', 'it', 'e2e']),
  createCommandTest('test:unit', 'unit tests', ['unit']),
  createCommandTest('test:it', 'integration tests', ['it']),
  createCommandTest('test:e2e', 'end-to-end tests', ['e2e']),
  createCommandTest('node:test', 'all tests', ['unit', 'it', 'e2e'], true),
  createCommandTest('node:test:unit', 'unit tests', ['unit'], true),
  createCommandTest('node:test:it', 'integration tests', ['it'], true),
  createCommandTest('node:test:e2e', 'end-to-end tests', ['e2e'], true),
)
