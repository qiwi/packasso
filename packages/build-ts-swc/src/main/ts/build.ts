import { ModuleCommand } from '@packasso/core'

export const build: ModuleCommand = async () => ({
  commands: [
    'rimraf target/cjs target/esm target/dts',
    [
      'swc src -d target/cjs.tmp/src --source-maps --no-swcrc --config-file swc.cjs.json',
      'swc src -d target/esm.tmp/src --source-maps --no-swcrc --config-file swc.esm.json',
      '! tsc -b tsconfig.dts.json',
    ],
    [
      'globby-cp target/cjs.tmp/src/main/ts target/cjs',
      'globby-cp target/esm.tmp/src/main/ts target/esm',
    ],
    [
      'rimraf target/cjs.tmp target/esm.tmp',
      'tsc-esm-fix --target target/cjs --ext .cjs --fillBlank',
      'tsc-esm-fix --target target/esm --ext .mjs --fillBlank --forceDefaultExport',
    ],
  ],
})
