#!/usr/bin/env node
import { existsSync } from 'node:fs'
import { resolve } from 'node:path'

import { createCommandInstall, Install, program } from '@packasso/core'

const install: Install = {
  data: (pkg) => [
    !pkg.tree && existsSync(resolve(pkg.absPath, 'src', 'main', 'ts', 'bin.ts'))
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
  ],
}

program(createCommandInstall(install))
