import {
  bin,
  cmd,
  Commands,
  ContextInstallData,
  execute,
  install,
  uninstall,
} from '@packasso/core'

const buildStampJson = 'target/buildstamp.json'

const data: ContextInstallData = ({ pkg }) => [
  pkg.leaf || pkg.unit
    ? {
        'package.json': {
          publishConfig: {
            files: [buildStampJson],
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
    await execute(cmd(bin('rimraf', context), { _: [buildStampJson] }), [
      context.pkg,
      ...context.pkgs,
    ])
  },
  build: async (context) => {
    await execute(
      cmd(bin('buildstamp', context), {
        'out.path': buildStampJson,
        'out.jsonSeparator': 'double-space',
        git: true,
        'docker.imageTag': '${IMAGE_TAG:-none}',
        'date.format': 'iso',
      }),
      context.pkg.tree ? context.pkgs : context.pkg,
    )
  },
}
