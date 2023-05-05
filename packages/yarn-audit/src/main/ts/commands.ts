import { cmd, Commands, execute } from '@packasso/core'
import lodash from 'lodash'

const levelExitCodes: Record<string, number> = {
  info: 1,
  low: 2,
  moderate: 4,
  high: 8,
  critical: 16,
}

export const commands: Commands = {
  audit: async ({ pkg, args }) => {
    const { fix = false, level = 'moderate' } = args
    try {
      await execute(
        fix
          ? cmd('yarn-audit-fix', {
              'audit-level': level,
            })
          : cmd('yarn npm audit', {
              recursive: true,
              all: true,
              severity: level,
            }),
        pkg,
      )
    } catch (e) {
      if (
        lodash.isArray(e) &&
        e.every((e) => e.exitCode >= levelExitCodes[level])
      ) {
        return
      }
      throw e
    }
  },
}
