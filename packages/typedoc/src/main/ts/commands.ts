import {
  cmd,
  Commands,
  ContextInstallData,
  execute,
  install,
  uninstall,
} from '@packasso/core'

const data: ContextInstallData = ({ pkg }) => [
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
]

export const commands: Commands = {
  install: async (context) => {
    await install(context, data)
  },
  uninstall: async (context) => {
    await uninstall(context, data)
  },
  clean: async ({ pkg, pkgs }) => {
    await execute('rimraf target/docs', [pkg, ...pkgs])
  },
  build: async ({ pkg, pkgs }) => {
    await execute(
      cmd('typedoc', { skipErrorChecking: true, logLevel: 'Error' }),
      pkg.tree ? pkgs : pkg,
    )
  },
  purge: async ({ pkg, pkgs }) => {
    await execute('rimraf typedoc.json', [pkg, ...pkgs])
  },
}
