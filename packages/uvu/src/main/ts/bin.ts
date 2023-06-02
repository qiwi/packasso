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
} from '@packasso/core'

program(
  createCommandClean(['target/coverage']),
  createCommandPurge(['coverage', 'jest.config.*', 'tsconfig.test.json']),
  createCommand('test', 'test')
    .addOption(createOption('-u', 'update snapshots and screenshots'))
    .action(async (options) => {
      const { cwd, preset, u } = options
      const { root, queuePackages } = await getTopo({ cwd }, preset)
      const paths = queuePackages.map(({ relPath }) => relPath)
      const many = paths.length > 1
      const mainPaths = `${
        root.tree
          ? `${many ? '{' : ''}${paths.join(',')}${many ? '}' : ''}/`
          : ''
      }src/main/{ts,js}`
      const testPaths = `${
        root.tree
          ? `${many ? '(' : ''}${paths.join('|')}${many ? ')' : ''}/`
          : ''
      }src/test/[jt]s/.*.(spec|test).[jt]sx?`
      await execute(
        cmd(
          'c8',
          {
            all: true,
            o: 'target/coverage',
            r: ['html', 'text', 'lcov'],
            n: `'${mainPaths}'`,
            _: [
              cmd('uvu', {
                r: ['tsm', 'earljs/uvu'],
                _: ['.', `'${testPaths}'`],
              }),
            ],
          },
          u ? { UPDATE_SNAPSHOTS: true } : {},
        ),
        preset ? root.absPath : root,
      )
    }),
)
