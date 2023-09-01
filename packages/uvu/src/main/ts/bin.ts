#!/usr/bin/env node
import {
  cmd,
  createCommand,
  createCommandClean,
  createCommandPurge,
  createOption,
  execute,
  ExtraTopoContext,
  getTopo,
  program,
  testCoverageDir,
  testCoverageMergeAndReport,
  testSuffixes,
  TestType,
} from '@packasso/core'

const paths = (topo: ExtraTopoContext, type: TestType, runner?: string) => {
  const { root, queuePackages } = topo
  const paths = queuePackages.map(({ relPath }) => relPath)
  const includeDirs = root.tree
    ? `${paths.length === 1 ? '' : '{'}${paths.join(',')}${
        paths.length === 1 ? '' : '}'
      }/`
    : ''
  const include = `'${includeDirs}src/main/{ts,js}'`
  const patternDirs = root.tree
    ? `${paths.length === 1 ? '' : '('}${paths.join('|')}${
        paths.length === 1 ? '' : ')'
      }/`
    : ''
  const patternSuffixes = `(${testSuffixes[type].join('|')})${
    runner ? '.' : ''
  }${runner ?? ''}`
  const pattern = `'${patternDirs}src/test/[jt]s/.*.${patternSuffixes}.[jt]sx?'`
  return {
    include,
    pattern,
  }
}

const createCommandTest = (
  name: string,
  description: string,
  types: TestType[],
  runner?: string,
) =>
  createCommand(name, description)
    .addOption(createOption('-u', 'update snapshots and screenshots'))
    .action(async (options) => {
      const { cwd, preset, u } = options
      const topo = await getTopo({ cwd }, preset)
      const { root } = topo
      for (const type of types) {
        const { include, pattern } = paths(topo, type, runner)
        await execute(
          cmd(
            'c8',
            {
              all: true,
              o: `${testCoverageDir}-${type}-uvu`,
              r: ['json', 'lcov', 'html'],
              n: include,
              _: [
                cmd('uvu', {
                  r: ['tsm', 'earljs/uvu'],
                  _: ['.', pattern],
                }),
              ],
            },
            u ? { UPDATE_SNAPSHOTS: true } : {},
          ),
          preset ? root.absPath : root,
        )
      }
      await testCoverageMergeAndReport(testCoverageDir, root, preset)
    })

program(
  createCommandClean([`${testCoverageDir}-*-uvu`, testCoverageDir]),
  createCommandPurge(['coverage', 'tsconfig.test.json']),
  createCommandTest('uvu:test', 'all tests', ['unit', 'it', 'e2e'], 'uvu'),
  createCommandTest('uvu:test:unit', 'unit tests', ['unit'], 'uvu'),
  createCommandTest('uvu:test:it', 'integration tests', ['it'], 'uvu'),
  createCommandTest('uvu:test:e2e', 'end-to-end tests', ['e2e'], 'uvu'),
  createCommandTest('test', 'all tests', ['unit', 'it', 'e2e']),
  createCommandTest('test:unit', 'unit tests', ['unit']),
  createCommandTest('test:it', 'integration tests', ['it']),
  createCommandTest('test:e2e', 'end-to-end tests', ['e2e']),
)
