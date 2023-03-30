import {
  cmd,
  Commands,
  ContextInstallData,
  execute,
  install,
  uninstall,
} from '@packasso/core'

const data: ContextInstallData = ({ pkg }) => [
  pkg.tree || pkg.unit
    ? {
        'package.json': {
          optionalDependencies: {
            prettier: '2.8.7',
            'prettier-config-qiwi': '2.1.0',
          },
        },
      }
    : {},
  pkg.leaf || pkg.unit
    ? {
        '.prettierrc.json': `"prettier-config-qiwi"`,
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
  lint: async ({ pkg, pkgs, args }) => {
    await execute(
      cmd('prettier', {
        loglevel: 'warn',
        ...(args.fix ? { write: true } : { check: true }),
        _: pkg.tree ? pkgs.map(({ relPath }) => `${relPath}/src`) : ['src'],
      }),
      pkg,
    )
  },
  purge: async ({ pkg, pkgs }) => {
    await execute('rimraf .prettierrc .prettierrc.* prettier.config.*', [
      pkg,
      ...pkgs,
    ])
  },
}
