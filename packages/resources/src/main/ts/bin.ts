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
              files: ['target/resources/**/*'],
            },
          },
        }
      : {},
  ],
}

program(
  createCommandInstall(install),
  createCommandClean(['target/resources']),
  createCommand('build', 'build').action(async (options) => {
    const { cwd, preset } = options
    const { root, queuePackages } = await getTopo({ cwd }, preset)
    await execute(
      cmd('globby-cp', {
        _: ['src/main/resources', 'target/resources'],
      }),
      root.tree ? queuePackages : preset ? root.absPath : root,
    )
  }),
)
