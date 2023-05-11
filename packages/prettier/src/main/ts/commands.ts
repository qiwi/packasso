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
        '.prettierrc.json': `"prettier-config-qiwi"`,
      }
    : {},
]

const deps = ['prettier', 'prettier-config-qiwi']

export const commands: Commands = {
  install: async (context) => {
    await install(data, deps, context)
  },
  uninstall: async (context) => {
    await uninstall(data, deps, context)
  },
  lint: async (context) => {
    await execute(
      cmd(bin('prettier', context), {
        loglevel: 'warn',
        ...(context.args.fix ? { write: true } : { check: true }),
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
        _: ['.prettierrc', '.prettierrc.*', 'prettier.config.*'],
      }),
      [context.pkg, ...context.pkgs],
    )
  },
}
