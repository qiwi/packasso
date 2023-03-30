import { existsSync } from 'node:fs'
import { resolve } from 'node:path'

import {
  bin,
  Commands,
  ContextInstallData,
  install,
  uninstall,
} from '@packasso/core'

const data: ContextInstallData = ({ pkg, root }) => [
  pkg.leaf && existsSync(resolve(pkg.absPath, 'src', 'main', 'ts', 'bin.ts'))
    ? {
        'package.json': {
          bin: {
            [pkg.name.replaceAll('@', '').replaceAll('/', '-')]:
              './target/esm/bin.mjs',
          },
        },
      }
    : {},
  pkg.leaf
    ? {
        'package.json': {
          scripts: {
            packasso: bin(pkg, root, '@packasso/cli', true),
          },
        },
      }
    : {},
]

export const commands: Commands = {
  install: async (context) => {
    await install(data(context), context.pkg)
  },
  uninstall: async (context) => {
    await uninstall(data(context), context.pkg)
  },
}
