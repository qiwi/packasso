import {
  cmd,
  Commands,
  ContextInstallData,
  execute,
  install,
  uninstall,
} from '@packasso/core'

const eslintConfigQiwi = 'eslint-config-qiwi'

const data: ContextInstallData = ({ pkg }) => [
  pkg.leaf || pkg.unit
    ? {
        '.eslintrc.json': {
          extends: eslintConfigQiwi,
        },
      }
    : {},
]

export const commands: Commands = {
  install: async (context) => {
    await install(context, data, ['eslint', eslintConfigQiwi])
  },
  uninstall: async (context) => {
    await uninstall(context, data, ['eslint', eslintConfigQiwi])
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
