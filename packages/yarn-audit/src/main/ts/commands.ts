import { cmd, Commands, execute } from '@packasso/core'

export const commands: Commands = {
  audit: async ({ pkg, args }) => {
    await execute(
      args.fix
        ? cmd('yarn-audit-fix', { 'audit-level': 'moderate' })
        : cmd('yarn npm audit', {
            recursive: true,
            all: true,
            severity: 'moderate',
          }),
      pkg,
    )
  },
}
