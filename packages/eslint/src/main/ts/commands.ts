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
  lint: async (context) => {
    await execute(
      cmd(bin('eslint', context), {
        fix: context.args.fix,
        _: context.pkg.tree
          ? context.pkgs.map(({ relPath }) => `${relPath}/src`)
          : ['src'],
      }),
      context.pkg,
    )
  },
  purge: async (context) => {
    await execute(
      cmd(bin('rimraf', context), {
        _: ['.eslintrc', '.eslintrc.*', 'eslint.config.*'],
      }),
      [context.pkg, ...context.pkgs],
    )
  },
}
