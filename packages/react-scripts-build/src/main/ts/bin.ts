#!/usr/bin/env node
import {
  cmd,
  createCommand,
  createCommandClean,
  createCommandInstall,
  execute,
  getTopo,
  Install,
  program,
} from '@packasso/core'

const install: Install = {
  data: (pkg) => [
    pkg.leaf || pkg.unit
      ? {
          'package.json': {
            publishConfig: {
              files: ['target/webapp'],
            },
          },
          '.env': [
            'BUILD_PATH=target/webapp',
            'DISABLE_ESLINT_PLUGIN=true',
            'ESLINT_NO_DEV_ERRORS=true',
            '',
          ].join('\n'),
          '.env.local': ['PUBLIC_URL=/', ''].join('\n'),
        }
      : {},
  ],
}

program(
  createCommandInstall(install),
  createCommandClean(['target/webapp']),
  createCommand('build', 'build').action(async (options) => {
    const { cwd, preset } = options
    const { root, queuePackages } = await getTopo({ cwd }, preset)
    await execute(cmd('react-scripts build'), root.tree ? queuePackages : root)
  }),
)
