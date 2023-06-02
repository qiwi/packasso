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

const install: Install = {
  data: (pkg) => [
    pkg.leaf || pkg.unit
      ? {
          'typedoc.json': {
            out: './target/docs',
            entryPoints: ['./src/main/ts'],
            excludeExternals: true,
            excludePrivate: false,
            hideGenerator: true,
            readme: 'README.md',
            theme: 'default',
          },
        }
      : {},
  ],
}

program(
  createCommandInstall(install),
  createCommandClean(['target/docs']),
  createCommandPurge(['typedoc.json']),
  createCommand('build', 'build').action(async (options) => {
    const { cwd, preset } = options
    const { root, queuePackages } = await getTopo({ cwd }, preset)
    await execute(
      cmd('typedoc', {
        skipErrorChecking: 'a',
        logLevel: 'Error',
      }),
      root.tree ? queuePackages : preset ? root.absPath : root,
    )
  }),
)
