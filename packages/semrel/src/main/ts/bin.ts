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
  publish,
} from '@packasso/core'

const install: Install = {
  data: (pkg) => [
    pkg.leaf || pkg.unit
      ? {
          'package.json': {
            publishConfig: {
              access: 'public',
            },
          },
          '.releaserc.json': {
            changelog: 'changelog',
            npmFetch: true,
          },
        }
      : {},
  ],
}

program([
  createCommandInstall(install),
  createCommandUninstall(install),
  createCommandPurge(['.releaserc', '.releaserc.*', 'release.config.*']),
  createCommand('release', 'release')
    .addOption(createOption('--dry-run', 'disable any publish logic'))
    .action(async (options) => {
      const { cwd, preset, dryRun } = options
      const { root, queuePackages } = await getTopo({ cwd }, preset)
      if (!dryRun) {
        for (const pkg of queuePackages) {
          await publish(pkg)
        }
      }
      if (root.tree) {
        await execute(
          cmd('zx-bulk-release', {
            'dry-run': dryRun,
          }),
          preset ? root.absPath : root,
        )
      }
    }),
])
