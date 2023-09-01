#!/usr/bin/env node
import {
  cmd,
  createCommand,
  createCommandClean,
  createCommandPurge,
  execute,
  getTopo,
  program,
} from '@packasso/core'
import fg from 'fast-glob'

const createCommandTest = (name: string, description: string, suffix: string) =>
  createCommand(name, description).action(async (options) => {
    const { cwd, preset } = options
    const { root, queuePackages } = await getTopo({ cwd }, preset)
    const srcTest = `src/test/{ts,js}/**/*.${suffix}.{ts,js,tsx,jsx}`
    const files = await fg.glob(
      root.tree
        ? queuePackages.map(({ relPath }) => `${relPath}/${srcTest}`)
        : srcTest,
      { ignore: ['node_modules'] },
    )
    const paths = queuePackages.map(({ relPath }) => relPath)
    const many = paths.length > 1
    const mainPaths = `${
      root.tree ? `${many ? '{' : ''}${paths.join(',')}${many ? '}' : ''}/` : ''
    }src/main/{ts,js}`
    await execute(
      cmd('c8', {
        r: ['html', 'text', 'lcov'],
        n: `'${mainPaths}'`,
        o: './target/coverage',
        _: cmd('node', {
          test: true,
          loader: 'tsx',
          _: files,
        }),
      }),
      root,
    )
  })

program(
  createCommandClean(['target/coverage']),
  createCommandPurge(['coverage', 'jest.config.*', 'tsconfig.test.json']),
  createCommandTest('test', 'unit tests', '{spec,test,it,e2e}'),
  createCommandTest('test:unit', 'unit tests', '{spec,test}'),
  createCommandTest('test:it', 'integration tests', 'it'),
  createCommandTest('test:e2e', 'end-to-end tests', 'e2e'),
)
