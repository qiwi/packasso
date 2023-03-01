import { ModuleCommand } from '@packasso/core'

export const build: ModuleCommand = async () => ({
  commands: [
    'rimraf target/cjs target/esm',
    '! tsc -b tsconfig.cjs.json tsconfig.esm.json',
    [
      'tsc-esm-fix --target target/cjs --ext .cjs --fillBlank',
      'tsc-esm-fix --target target/esm --ext .mjs --fillBlank --forceDefaultExport',
    ],
  ],
})
