#!/usr/bin/env node
import {
  cmd,
  createCommand,
  createCommandClean,
  createCommandInstall,
  createCommandPurge,
  execute,
  getTopo,
  Install,
  program,
} from '@packasso/core'

const tsEsm = 'tsconfig.esm.json'
const targetEsm = 'target/esm'

const install: Install = {
  data: (pkg) => [
    pkg.leaf || pkg.unit
      ? {
          'nest-cli.json': {
            collection: '@nestjs/schematics',
            sourceRoot: 'src/main/ts',
            compilerOptions: {
              plugins: ['@nestjs/swagger/plugin'],
            },
          },
          [tsEsm]: {
            extends: './tsconfig.json',
            compilerOptions: {
              composite: true,
              rootDir: './src/main/ts',
              outDir: './target/esm',
              tsBuildInfoFile: './target/esm/.tsbuildinfo',
            },
          },
        }
      : {},
  ],
}

const TSCONFIG = '@packasso/tsconfig'

const modules = [TSCONFIG]

program(
  createCommandInstall(install, modules),
  createCommandClean([targetEsm]),
  createCommand('start', 'start').action(async (options) => {
    const { cwd, preset } = options
    const { root, queuePackages } = await getTopo({ cwd }, preset)
    await execute(
      cmd(`node ${targetEsm}/main`),
      root.tree ? queuePackages : preset ? root.absPath : root,
    )
  }),
  createCommand('build', 'build').action(async (options) => {
    const { cwd, preset } = options
    const { root, queuePackages } = await getTopo({ cwd }, preset)
    await execute(
      cmd('nest build', {
        p: tsEsm,
      }),
      root.tree ? queuePackages : preset ? root.absPath : root,
    )
    await execute(
      [
        cmd('tsc-esm-fix', {
          target: targetEsm,
        }),
      ],
      root.tree ? queuePackages : preset ? root.absPath : root,
    )
    await execute(
      [
        cmd('nestjs-esm-fix', {
          _: [targetEsm],
          'no-openapi-var': true,
        }),
      ],
      root.tree ? queuePackages : preset ? root.absPath : root,
    )
  }),
  createCommandClean([targetEsm]),
  createCommandPurge(['dist', 'nest-cli.json', 'tsconfig.*.json'], modules),
)
