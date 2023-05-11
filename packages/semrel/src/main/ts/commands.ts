import {
  bin,
  cmd,
  Commands,
  ContextInstallData,
  execute,
  install,
  publish,
  uninstall,
} from '@packasso/core'

const data: ContextInstallData = ({ pkg }) => [
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
]

export const commands: Commands = {
  install: async (context) => {
    await install(data, [], context)
  },
  uninstall: async (context) => {
    await uninstall(data, [], context)
  },
  release: async (context) => {
    for (const pkg of context.pkgs) {
      await publish(pkg)
    }
    if (context.pkg.tree) {
      await execute(cmd(bin('zx-bulk-release', context)), context.pkg)
    }
  },
  purge: async (context) => {
    await execute(
      cmd(bin('rimraf', context), {
        _: ['.releaserc', '.releaserc.*', 'release.config.*'],
      }),
      context.pkgs,
    )
  },
}
