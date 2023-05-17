import { bin, cmd, Commands, ContextInstallData, execute } from '@packasso/core'

const data: ContextInstallData = ({ pkg }) => [
  pkg.leaf || pkg.unit
    ? {
        '.env': [
          'DISABLE_ESLINT_PLUGIN=true',
          'ESLINT_NO_DEV_ERRORS=true',
          '',
        ].join('\n'),
        '.env.local': ['PUBLIC_URL=/', ''].join('\n'),
      }
    : {},
]

export const commands: Commands = {
  start: async (context) => {
    await execute(
      cmd(bin('react-scripts', context), { _: ['start'] }),
      context.pkg.tree ? context.pkgs : context.pkg,
    )
  },
}
