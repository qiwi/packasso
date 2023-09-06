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
          '.releaserc.json': {
            ghPages: `gh-pages target/docs ${pkg.relPath}`,
          },
        }
      : {},
  ],
}

program(
  createCommandInstall(install),
  createCommandClean(['target/docs']),
  createCommandPurge(['typedoc.*', '.config/typedoc.*', 'docs']),
  createCommand('build', 'build').action(async (options) => {
    const { cwd, preset } = options
    const { root, queuePackages } = await getTopo({ cwd }, preset)
    await execute(
      cmd('typedoc', {
        out: './target/docs',
        entryPoints: ['./src/main/ts', './src/main/js'],
        skipErrorChecking: true,
        hideGenerator: true,
        logLevel: 'Error',
      }),
      root.tree ? queuePackages : preset ? root.absPath : root,
    )
  }),
)
