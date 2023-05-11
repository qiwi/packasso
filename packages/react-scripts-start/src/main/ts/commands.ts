import { bin, cmd, Commands, execute } from '@packasso/core'

export const commands: Commands = {
  start: async (context) => {
    await execute(
      cmd(bin('react-scripts', context), { _: ['start'] }),
      context.pkg.tree ? context.pkgs : context.pkg,
    )
  },
}
