import { ModuleCommand } from '@packasso/core'

export const build: ModuleCommand = async (pkg) => ({
  commands: [
    'rimraf target/cjs target/esm',
    { command: 'tsc -b tsconfig.cjs.json tsconfig.esm.json', cwd: pkg.absPath },
    [
      'tsc-esm-fix --target target/cjs --ext .cjs --fillBlank',
      'tsc-esm-fix --target target/esm --ext .mjs --fillBlank --forceDefaultExport',
    ],
  ],
})
