#!/usr/bin/env node
import {
  cmd,
  createCommand,
  execute,
  getNodeModules,
  getTopo,
  program,
} from '@packasso/core'
import { glob } from 'fast-glob'

const createCommandTest = (name: string, description: string, suffix?: string) =>
  createCommand(name, description)
    .action(async (options) => {
      const { cwd, preset } = options
      const { root } = await getTopo({ cwd }, preset)
      const files = await glob(`**/src/test/{ts,js}/**/*.${suffix}.{ts,js,tsx,jsx}`, { ignore: ['node_modules']})

      await execute(
        cmd(
          `${getNodeModules()}/.bin/c8`,
          {
            r: ['html', 'text', 'lcov'],
            exclude: 'src/test',
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
