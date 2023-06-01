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
  deps: [
    'eslint',
    'eslint-config-qiwi',
    'eslint-plugin-unicorn',
    'eslint-plugin-sonarjs',
    'eslint-plugin-react-hooks',
    'eslint-plugin-react',
    '@typescript-eslint',
  ],
  data: (pkg) => [
    pkg.leaf || pkg.unit
      ? {
          '.eslintrc.json': {
            extends: 'eslint-config-qiwi',
          },
        }
      : {},
  ],
}

program('@packasso/eslint', 'eslint', [
  createCommandInstall(install),
  createCommandUninstall(install),
  createCommandPurge(['.eslintrc', '.eslintrc.*', 'eslint.config.*']),
  createCommand('lint', 'lint')
    .addOption(createOption('--fix', 'fix'))
    .action(async (options) => {
      const { cwd, preset, fix } = options
      const { root, queuePackages } = await getTopo({ cwd }, preset)
      await execute(
        cmd('eslint', {
          fix,
          _: root.tree
            ? queuePackages.map(({ relPath }) => `${relPath}/src`)
            : ['src'],
        }),
        preset ? root.absPath : root,
      )
    }),
])
