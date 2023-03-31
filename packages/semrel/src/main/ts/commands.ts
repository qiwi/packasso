import {
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
    await install(data(context), context.pkg)
  },
  uninstall: async (context) => {
    await uninstall(data(context), context.pkg)
  },
  release: async ({ pkg, pkgs }) => {
    for (const pkg of pkgs) {
      await publish(pkg)
    }
    if (pkg.tree) {
      await execute('zx-bulk-release', pkg)
    }
  },
  purge: async ({ pkgs }) => {
    await execute('rimraf .releaserc .releaserc.* release.config.*', pkgs)
  },
}
