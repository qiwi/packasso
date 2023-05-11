import { bin, cmd, Commands, execute } from '@packasso/core'
import lodash from 'lodash'

const levelExitCodes: Record<string, number> = {
  info: 1,
  low: 2,
  moderate: 4,
  high: 8,
  critical: 16,
}

export const commands: Commands = {
  audit: async (context) => {
    const { fix = false, level = 'moderate' } = context.args
    try {
      await execute(
        fix
          ? cmd(bin('yarn-audit-fix', context), {
              'audit-level': level,
            })
          : cmd(bin('yarn', context), {
              _: ['npm audit'],
              recursive: true,
              all: true,
              severity: level,
            }),
        context.pkg,
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
