import {
  bin,
  cmd,
  Commands,
  execute,
  install,
  InstallData,
  uninstall,
} from '@packasso/core'

const data: InstallData = [
  {
    '.browserslistrc': [
      '[production]',
      '> 0.2%',
      'not dead',
      'not op_mini all',
      '',
      '[development]',
      'last 1 chrome version',
      'last 1 firefox version',
      'last 1 safari version',
      '',
    ].join('\n'),
  },
]

export const commands: Commands = {
  install: async (context) => {
    await install(data, [], context)
  },
  uninstall: async (context) => {
    await uninstall(data, [], context)
  },
  purge: async (context) => {
    await execute(cmd(bin('rimraf', context), { _: ['.browserslistrc'] }), [
      context.pkg,
      ...context.pkgs,
    ])
  },
}
