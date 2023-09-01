#!/usr/bin/env node
import {
  cmd,
  createCommand,
  execute,
  getTopo,
  program,
} from '@packasso/core'
import { glob } from 'fast-glob'

const createCommandTest = (name: string, description: string, suffix?: string) =>
  createCommand(name, description)
    .action(async (options) => {
      const { cwd, preset } = options
      const { root, queuePackages } = await getTopo({ cwd }, preset)
      const files = await glob(
        root.tree
          ? queuePackages.map(it => it.relPath + `/src/test/{ts,js}/**/*.${suffix}.{ts,js,tsx,jsx}`)
          : `src/test/{ts,js}/**/*.${suffix}.{ts,js,tsx,jsx}`,
        { ignore: ['node_modules'] }
      )
      const paths = queuePackages.map(({ relPath }) => relPath)
      const many = paths.length > 1
      const mainPaths = `${
        root.tree
          ? `${many ? '{' : ''}${paths.join(',')}${many ? '}' : ''}/`
          : ''
      }src/main/{ts,js}`

      await execute(
        cmd(
          'c8',
          {
            r: ['html', 'text', 'lcov'],
            n: `'${mainPaths}'`,
            o: `./target/coverage-${suffix}-node`,
            _: cmd(
              'node',
              {
                test: true,
                loader: 'tsx',
                _: files
              }
            )
          }
        ),
        root
      )
    })

program(
  createCommandTest('test:unit', 'unit tests', 'unit'),
  createCommandTest('test:it', 'integration tests', 'it'),
  createCommandTest('test:e2e', 'end-to-end tests', 'e2e'),
)
