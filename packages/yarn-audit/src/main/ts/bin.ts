#!/usr/bin/env node
import {
  cmd,
  createCommand,
  createOption,
  execute,
  getTopo,
  program,
} from '@packasso/core'
import lodash from 'lodash'

const levelExitCodes: Record<string, number> = {
  info: 1,
  low: 2,
  moderate: 4,
  high: 8,
  critical: 16,
}

program(
  createCommand('audit', 'audit')
    .addOption(createOption('--fix', 'fix'))
    .addOption(
      createOption('--level <level>', 'level')
        .choices(Object.keys(levelExitCodes))
        .default('moderate'),
    )
    .action(async (options) => {
      const { cwd, preset, fix, level } = options
      const { root } = await getTopo({ cwd }, preset)
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
          preset ? root.absPath : root,
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
    }),
)
