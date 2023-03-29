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
          files: ['target/resources/**/*'],
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
    await execute('rimraf target/resources', [pkg, ...pkgs])
  },
  build: async ({ pkg, pkgs }) => {
    await execute(
      'globby-cp src/main/resources target/resources',
      pkg.tree ? pkgs : pkg,
    )
  },
}
