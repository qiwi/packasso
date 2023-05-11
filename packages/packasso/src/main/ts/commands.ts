import { existsSync } from 'node:fs'
import { resolve } from 'node:path'

import {
  cmd,
  Commands,
  ContextInstallData,
  install,
  npx,
  uninstall,
} from '@packasso/core'

const data: ContextInstallData = ({ pkg, root }) => [
  pkg.leaf && existsSync(resolve(pkg.absPath, 'src', 'main', 'ts', 'bin.ts'))
    ? {
        'package.json': {
          publishConfig: {
            bin: {
              [pkg.name.replaceAll('@', '').replaceAll('/', '-')]:
                './target/esm/bin.mjs',
            },
          },
        },
      }
    : {},
  pkg.leaf
    ? {
        'package.json': {
          scripts: {
            packasso: cmd(
              npx(pkg, root, 'packasso'),
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
    await install(data, [], context)
  },
  uninstall: async (context) => {
    await uninstall(data, [], context)
  },
}
