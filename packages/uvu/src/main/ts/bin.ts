#!/usr/bin/env node
import {
  cmd,
  createCommandClean,
  createCommandPurge,
  createCommandTest,
  execute,
  getTopo,
  program,
  testCoverageDir,
  testSuffixes,
  testTypes,
} from '@packasso/core'

program(
  createCommandClean([
    `${testCoverageDir}-unit-uvu`,
    `${testCoverageDir}-it-uvu`,
    `${testCoverageDir}-e2e-uvu`,
  ]),
  createCommandPurge(['tsconfig.test.json']),
  createCommandTest().action(async (options) => {
    const { cwd, preset, index, u, unit, it, e2e } = options
    const { root, queuePackages } = await getTopo({ cwd }, preset)
    await execute(
      testTypes(unit, it, e2e).map((type) =>
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
                  index ? '.uvu' : ''
                }.[jt]sx?'`,
              ],
            }),
          },
          u ? { UPDATE_SNAPSHOTS: true } : {},
        ),
      ),
      root.tree ? queuePackages : preset ? root.absPath : root,
    )
  }),
)
