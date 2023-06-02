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
  createCommand('build', 'build').action(async (options) => {
    const { cwd, preset } = options
    const { root, queuePackages } = await getTopo({ cwd }, preset)
    await execute(
      cmd('buildstamp', {
        'out.path': buildStampJson,
        'out.jsonSeparator': 'double-space',
        git: true,
        'docker.imageTag': '${IMAGE_TAG:-none}',
        'date.format': 'iso',
      }),
      root.tree ? queuePackages : preset ? root.absPath : root,
    )
  }),
)
