#!/usr/bin/env node
import {
  cmd,
  createCommand,
  createCommandClean,
  createCommandPurge,
  createOption,
  execute,
  getTopo,
  program,
  testCoverageDir,
  testCoverageMergeAndReport,
  testSuffixes,
  TestType,
} from '@packasso/core'

const createCommandTest = (
  name: string,
  description: string,
  types: TestType[],
  suffix = false,
) =>
  createCommand(name, description)
    .addOption(createOption('-u', 'update snapshots and screenshots'))
    .action(async (options) => {
      const { cwd, preset, u } = options
      const topo = await getTopo({ cwd }, preset)
      const { root, queuePackages } = topo
      await execute(
        types.map((type) =>
          cmd(
            'c8',
            {
              all: true,
              o: `${testCoverageDir}-${type}-uvu`,
              r: ['json', 'lcov'],
              n: "'src/main/{ts,js}'",
              _: cmd('uvu', {
                r: ['tsm', 'earljs/uvu'],
                _: [
                  '.',
                  `'src/test/[jt]s/.*.(${testSuffixes[type].join('|')})${
                    suffix ? '.uvu' : ''
                  }.[jt]sx?'`,
                ],
              }),
            },
            u ? { UPDATE_SNAPSHOTS: true } : {},
          ),
        ),
        root.tree ? queuePackages : preset ? root.absPath : root,
      )
      await testCoverageMergeAndReport(topo, types, 'uvu', preset)
    })

program(
  createCommandClean([`${testCoverageDir}-*`, testCoverageDir]),
  createCommandPurge(['coverage', 'tsconfig.test.json']),
  createCommandTest('test', 'all tests', ['unit', 'it', 'e2e']),
  createCommandTest('test:unit', 'unit tests', ['unit']),
  createCommandTest('test:it', 'integration tests', ['it']),
  createCommandTest('test:e2e', 'end-to-end tests', ['e2e']),
  createCommandTest('uvu:test', 'all tests', ['unit', 'it', 'e2e'], true),
  createCommandTest('uvu:test:unit', 'unit tests', ['unit'], true),
  createCommandTest('uvu:test:it', 'integration tests', ['it'], true),
  createCommandTest('uvu:test:e2e', 'end-to-end tests', ['e2e'], true),
)
