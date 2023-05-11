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
  clean: async (context) => {
    await execute(
      cmd(bin('rimraf', context), { _: ['target/webapp'] }),
      context.pkg.tree ? context.pkgs : context.pkg,
    )
  },
  build: async (context) => {
    await execute(
      cmd(bin('react-scripts', context), { _: ['build'] }),
      context.pkg.tree ? context.pkgs : context.pkg,
    )
  },
}
