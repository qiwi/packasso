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
        'package.json': {
          publishConfig: {
            files: ['target/resources/**/*'],
          },
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
    await execute(cmd(bin('rimraf', context), { _: ['target/resources'] }), [
      context.pkg,
      ...context.pkgs,
    ])
  },
  build: async (context) => {
    await execute(
      cmd(bin('globby-cp', context), {
        _: ['src/main/resources', 'target/resources'],
      }),
      context.pkg.tree ? context.pkgs : context.pkg,
    )
  },
}
