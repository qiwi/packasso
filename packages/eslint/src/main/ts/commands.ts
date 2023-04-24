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
        '.eslintrc.json': {
          extends: 'eslint-config-qiwi',
        },
      }
    : {},
]

const deps = [
  'eslint',
  'eslint-config-qiwi',
  'eslint-plugin-unicorn',
  'eslint-plugin-sonarjs',
  'eslint-plugin-react-hooks',
  'eslint-plugin-react',
  '@typescript-eslint',
]

export const commands: Commands = {
  install: async (context) => {
    await install(data, deps, context)
  },
  uninstall: async (context) => {
    await uninstall(data, deps, context)
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
