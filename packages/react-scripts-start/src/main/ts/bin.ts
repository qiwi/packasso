#!/usr/bin/env node
import {
  cmd,
  createCommand,
  createCommandInstall,
  createCommandUninstall,
  execute,
  getTopo,
  Install,
  program,
} from '@packasso/core'

const install: Install = {
  data: (pkg) => [
    pkg.leaf || pkg.unit
      ? {
          '.env': [
            'DISABLE_ESLINT_PLUGIN=true',
            'ESLINT_NO_DEV_ERRORS=true',
            '',
          ].join('\n'),
          '.env.local': ['PUBLIC_URL=/', ''].join('\n'),
        }
      : {},
  ],
}

program([
  createCommandInstall(install),
  createCommandUninstall(install),
  createCommand('start', 'start').action(async (options) => {
    const { cwd, preset } = options
    const { root, queuePackages } = await getTopo({ cwd }, preset)
    await execute(
      cmd('react-scripts start'),
      root.tree ? queuePackages : preset ? root.absPath : root,
    )
  }),
])
