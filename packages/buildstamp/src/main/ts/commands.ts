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
          files: ['target/buildstamp.json'],
        },
      }
    : {},
]

export const commands: Commands = {
  install: async (context) => {
    await install(context.pkg, ...data(context))
  },
  uninstall: async (context) => {
    await uninstall(context.pkg, ...data(context))
  },
  clean: async ({ pkg, pkgs }) => {
    await execute('rimraf target/buildstamp.json', [pkg, ...pkgs])
  },
  build: async ({ pkg, pkgs }) => {
    await execute(
      cmd('buildstamp', {
        'out.path': 'target/buildstamp.json',
        'out.jsonSeparator': 'double-space',
        git: true,
        'docker.imageTag': '${IMAGE_TAG:-none}',
        'date.format': 'iso',
      }),
      pkg.tree ? pkgs : pkg,
    )
  },
}
