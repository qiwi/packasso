import {
  bin,
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
    await install(data, [], context)
  },
  uninstall: async (context) => {
    await uninstall(data, [], context)
  },
  clean: async (context) => {
    await execute(cmd(bin('rimraf', context), { _: ['target/docs'] }), [
      context.pkg,
      ...context.pkgs,
    ])
  },
  build: async (context) => {
    await execute(
      cmd(bin('typedoc', context), {
        _: [],
        skipErrorChecking: 'a',
        logLevel: 'Error',
      }),
      context.pkg.tree ? context.pkgs : context.pkg,
    )
  },
  purge: async (context) => {
    await execute(cmd(bin('rimraf', context), { _: ['typedoc.json'] }), [
      context.pkg,
      ...context.pkgs,
    ])
  },
}
