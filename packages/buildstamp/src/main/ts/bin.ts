#!/usr/bin/env node
import {
  cmd,
  createCommand,
  createCommandClean,
  createCommandInstall,
  createCommandPurge,
  execute,
  getTopo,
  Install,
  program,
} from '@packasso/core'

const buildStampJson = 'target/buildstamp.json'

const install: Install = {
  data: (pkg) => [
    pkg.leaf || pkg.unit
      ? {
          'package.json': {
            publishConfig: {
              files: [buildStampJson],
            },
          },
        }
      : {},
  ],
}

program(
  createCommandInstall(install),
  createCommandClean([buildStampJson]),
  createCommandPurge(['buildstamp.json']),
  createCommand('build', 'build').action(async (options) => {
    const { cwd, preset } = options
    const { root, queuePackages } = await getTopo({ cwd }, preset)
    await execute(
      cmd('buildstamp', {
        o: buildStampJson,
        git: true,
        ci: true,
        date: true,
      }),
      root.tree ? queuePackages : preset ? root.absPath : root,
    )
  }),
)
