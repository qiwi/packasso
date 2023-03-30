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
            eslint: '8.36.0',
            'eslint-config-qiwi': '2.1.1',
          },
        },
      }
    : {},
  pkg.leaf || pkg.unit
    ? {
        '.eslintrc.json': {
          extends: 'eslint-config-qiwi',
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
  lint: async ({ pkg, pkgs, args }) => {
    await execute(
      cmd('eslint', {
        fix: args.fix,
        _: pkg.tree ? pkgs.map(({ relPath }) => `${relPath}/src`) : ['src'],
      }),
      pkg,
    )
  },
  purge: async ({ pkg, pkgs }) => {
    await execute('rimraf .eslintrc .eslintrc.* eslint.config.*', [
      pkg,
      ...pkgs,
    ])
  },
}
