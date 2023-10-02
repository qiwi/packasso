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
  TestType,
} from '@packasso/core'

const coverageJson = 'coverage-final.json'
const mergeCmd = 'istanbul-merge'
const reportCmd = 'nyc report'
const types: TestType[] = ['unit', 'it', 'e2e']

program(
  createCommandClean([
    `${testCoverageDir}-unit`,
    `${testCoverageDir}-it`,
    `${testCoverageDir}-e2e`,
    testCoverageDir,
  ]),
  createCommandPurge(['coverage']),
  createCommandTest().action(async (options) => {
    const { cwd, preset } = options
    const { root, queuePackages } = await getTopo({ cwd }, preset)
    await execute(
      types.map((type) =>
        cmd(mergeCmd, {
          _: `'${testCoverageDir}-${type}-*/${coverageJson}'`,
          out: `${testCoverageDir}-${type}/${coverageJson}`,
        }),
      ),
      root.tree ? queuePackages : preset ? root.absPath : root,
    )
    await execute(
      cmd(mergeCmd, {
        _: types.map((type) => `${testCoverageDir}-${type}/${coverageJson}`),
        out: `${testCoverageDir}/${coverageJson}`,
      }),
      root.tree ? queuePackages : preset ? root.absPath : root,
    )
    await execute(
      [
        ...types.map((type) =>
          cmd(reportCmd, {
            t: `${testCoverageDir}-${type}`,
            reporter: ['lcov'],
            'report-dir': `${testCoverageDir}-${type}`,
          }),
        ),
        cmd(reportCmd, {
          t: testCoverageDir,
          reporter: ['lcov'],
          'report-dir': testCoverageDir,
        }),
      ],
      root.tree ? queuePackages : preset ? root.absPath : root,
    )
    if (root.tree) {
      await execute(
        [
          ...types.map((type) =>
            cmd(mergeCmd, {
              _: queuePackages.flatMap(
                (pkg) =>
                  `${pkg.relPath}/${testCoverageDir}-${type}/${coverageJson}`,
              ),
              out: `${testCoverageDir}-${type}/${coverageJson}`,
            }),
          ),
          cmd(mergeCmd, {
            _: queuePackages.flatMap(
              (pkg) => `${pkg.relPath}/${testCoverageDir}/${coverageJson}`,
            ),
            out: `${testCoverageDir}/${coverageJson}`,
          }),
        ],
        preset ? root.absPath : root,
      )
      await execute(
        [
          ...types.map((type) =>
            cmd(reportCmd, {
              t: `${testCoverageDir}-${type}`,
              reporter: ['lcov'],
              'report-dir': `${testCoverageDir}-${type}`,
            }),
          ),
          cmd(reportCmd, {
            t: testCoverageDir,
            reporter: ['lcov'],
            'report-dir': testCoverageDir,
          }),
        ],
        preset ? root.absPath : root,
      )
    }
  }),
)
