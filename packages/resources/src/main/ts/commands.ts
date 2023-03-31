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
            files: ['target/resources/**/*'],
          },
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
