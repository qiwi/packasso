import { cmd, Commands, execute } from '@packasso/core'

export const commands: Commands = {
  start: async ({ pkg, pkgs }) => {
    await execute(cmd('react-scripts start'), pkg.tree ? pkgs : pkg)
  },
}
