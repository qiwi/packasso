import {
  Commands,
  ContextInstallData,
  execute,
  install,
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
    await install(context, data)
  },
  uninstall: async (context) => {
    await uninstall(context, data)
  },
  release: async ({ pkg }) => {
    if (pkg.tree) {
      await execute('zx-bulk-release', pkg)
    }
  },
  purge: async ({ pkgs }) => {
    await execute('rimraf .releaserc .releaserc.* release.config.*', pkgs)
  },
}
