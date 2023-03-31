import {
  Commands,
  ContextInstallData,
  execute,
  install,
  readJson,
  uninstall,
  writeJson,
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
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { publishConfig = {}, ...json } = readJson(pkg.manifestPath) as any
      const { access, tag, registry, ...publishJson } = publishConfig
      writeJson(pkg.manifestPath, {
        ...json,
        ...publishJson,
        publishConfig: {
          access,
          tag,
          registry,
        },
        scripts: undefined,
      })
    }
    if (pkg.tree) {
      await execute('zx-bulk-release', pkg)
    }
  },
  purge: async ({ pkgs }) => {
    await execute('rimraf .releaserc .releaserc.* release.config.*', pkgs)
  },
}
