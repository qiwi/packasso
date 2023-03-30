import { existsSync } from 'node:fs'
import { resolve } from 'node:path'
import { env } from 'node:process'

import {
  bin,
  cmd,
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
            packasso: cmd(
              bin(pkg, root, '@packasso/cli'),
              {},
              {
                NODE_ENV: 'development',
                NPM_CONFIG_YES: 'true',
              },
            ),
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
