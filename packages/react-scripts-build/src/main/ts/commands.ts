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
        'package.json': {
          publishConfig: {
            files: ['target/webapp'],
          },
        },
        '.env': ['BUILD_PATH=target/webapp', ''].join('\n'),
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
  clean: async ({ pkg, pkgs }) => {
    await execute('rimraf target/webapp', pkg.tree ? pkgs : pkg)
  },
  build: async ({ pkg, pkgs }) => {
    await execute(cmd('react-scripts build'), pkg.tree ? pkgs : pkg)
  },
}
