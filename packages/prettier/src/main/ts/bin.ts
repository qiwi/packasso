#!/usr/bin/env node
import {
  cmd,
  createCommand,
  createCommandInstall,
  createCommandPurge,
  createCommandUninstall,
  createOption,
  execute,
  getTopo,
  Install,
  program,
} from '@packasso/core'

const install: Install = {
  deps: ['prettier', 'prettier-config-qiwi'],
  data: (pkg) => [
    pkg.leaf || pkg.unit
      ? {
          '.prettierrc.json': `"prettier-config-qiwi"`,
        }
      : {},
  ],
}

program('@packasso/prettier', 'prettier', [
  createCommandInstall(install),
  createCommandUninstall(install),
  createCommandPurge(['.prettierrc', '.prettierrc.*', 'prettier.config.*']),
  createCommand('lint', 'lint')
    .addOption(createOption('--fix', 'fix'))
    .action(async (options) => {
      const { cwd, preset, fix } = options
      const { root, queuePackages } = await getTopo({ cwd }, preset)
      await execute(
        cmd('prettier', {
          loglevel: 'warn',
          ...(fix ? { write: true } : { check: true }),
          _: root.tree
            ? queuePackages.map(({ relPath }) => `${relPath}/src`)
            : ['src'],
        }),
        preset ? root.absPath : root,
      )
    }),
])
