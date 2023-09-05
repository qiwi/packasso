#!/usr/bin/env node
import {
  cmd,
  createCommand,
  createCommandClean,
  createCommandPurge,
  execute,
  ExtraTopoContext,
  getTopo,
  program,
  testCoverageDir,
  testCoverageMergeAndReport,
  testSuffixes,
  TestType,
} from '@packasso/core'
import fg from 'fast-glob'

const paths = (topo: ExtraTopoContext, type: TestType, runner?: string) => {
  const { root, queuePackages } = topo
  const filesSuffixes = `{${testSuffixes[type].join(',')}}${runner ? '.' : ''}${
    runner ?? ''
  }`
  const filesPath = `src/test/{ts,js}/**/*.${filesSuffixes}.{ts,js,tsx,jsx}`
  const files = fg.globSync(
    root.tree
      ? queuePackages.map(({ relPath }) => `${relPath}/${filesPath}`)
      : filesPath,
    { ignore: ['node_modules'] },
  )
  const includeDirs = root.tree
    ? `${queuePackages.length === 1 ? '' : '{'}${queuePackages
        .map(({ relPath }) => relPath)
        .join(',')}${queuePackages.length === 1 ? '' : '}'}/`
    : ''
  const include = `'${includeDirs}src/main/{ts,js}'`
  return {
    files,
    include,
  }
}

const createCommandTest = (
  name: string,
  description: string,
  types: TestType[],
  runner?: string,
) =>
  createCommand(name, description).action(async (options) => {
    const { cwd, preset } = options
    const topo = await getTopo({ cwd }, preset)
    const { root } = topo
    for (const type of types) {
      const { include, files } = paths(topo, type, runner)
      await execute(
        cmd('c8', {
          all: true,
          o: `${testCoverageDir}-${type}-node`,
          r: ['json', 'lcov', 'html'],
          n: include,
          _: cmd('node', {
            test: true,
            loader: 'tsx',
            _: files,
          }),
        }),
        preset ? root.absPath : root,
      )
    }
    await testCoverageMergeAndReport(testCoverageDir, root, preset)
  })

program(
  createCommandClean([`${testCoverageDir}-*-node`, testCoverageDir]),
  createCommandPurge(['coverage', 'tsconfig.test.json']),
  createCommandTest('node:test', 'all tests', ['unit', 'it', 'e2e'], 'node'),
  createCommandTest('node:test:unit', 'unit tests', ['unit'], 'node'),
  createCommandTest('node:test:it', 'integration tests', ['it'], 'node'),
  createCommandTest('node:test:e2e', 'end-to-end tests', ['e2e'], 'node'),
  createCommandTest('test', 'all tests', ['unit', 'it', 'e2e']),
  createCommandTest('test:unit', 'unit tests', ['unit']),
  createCommandTest('test:it', 'integration tests', ['it']),
  createCommandTest('test:e2e', 'end-to-end tests', ['e2e']),
)
