#!/usr/bin/env node
import { existsSync } from 'node:fs'
import { resolve } from 'node:path'

import {
  cmd,
  createCommand,
  createCommandInstall,
  createCommandUninstall,
  Install,
  npx,
  program,
  run,
} from '@packasso/core'

const GIT_IGNORE = '@packasso/gitignore'
const LICENSE = '@packasso/license'
const YARN_AUDIT = '@packasso/yarn-audit'
const TSC = '@packasso/tsc'
const BUILD_STAMP = '@packasso/buildstamp'
const ESLINT = '@packasso/eslint'
const PRETTIER = '@packasso/prettier'
const UVU = '@packasso/uvu'
const SEMREL = '@packasso/semrel'

const modules: Record<string, string[]> = {
  install: [GIT_IGNORE, LICENSE, TSC, BUILD_STAMP, ESLINT, PRETTIER, SEMREL],
  uninstall: [GIT_IGNORE, LICENSE, TSC, BUILD_STAMP, ESLINT, PRETTIER, SEMREL],
  build: [BUILD_STAMP, TSC],
  lint: [ESLINT, PRETTIER],
  audit: [YARN_AUDIT],
  test: [UVU],
  release: [SEMREL],
  clean: [BUILD_STAMP, TSC, UVU],
  purge: [GIT_IGNORE, LICENSE, TSC, ESLINT, PRETTIER, UVU, SEMREL],
}

const install: Install = {
  data: (pkg) => [
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
                npx('packasso', pkg.absPath),
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
  ],
}

program(
  Object.keys(modules).map((command) => {
    if (command === 'install') {
      return createCommandInstall(install, modules.install)
    }
    if (command === 'uninstall') {
      return createCommandUninstall(install, modules.uninstall)
    }
    return createCommand(command, command).action(async (options, context) => {
      const { cwd, preset } = options
      await run(cwd, modules[command], command, preset, context)
    })
  }),
)
