import { ModuleCommand } from '@packasso/core'

export const test: ModuleCommand = async (pkg) => ({
  commands: [{ command: 'jest', cwd: pkg.absPath }],
})
