#!/usr/bin/env node
import {
  cmd,
  createCommand,
  createCommandClean,
  createCommandInstall,
  createCommandPurge,
  execute,
  getTopo,
  getTypeScriptReferences,
  Install,
  program,
} from '@packasso/core'

const tsDts = 'tsconfig.dts.json'
const swcCjs = 'swc.cjs.json'
const swcEsm = 'swc.esm.json'
const targetCjs = 'target/cjs'
const targetEsm = 'target/esm'
const targetDts = 'target/dts'
const targetCjsTmp = `${targetCjs}.tmp`
const targetEsmTmp = `${targetEsm}.tmp`

const install: Install = {
  data: (pkg, topo) => [
    pkg.leaf || pkg.unit
      ? {
          [swcCjs]: {
            $schema: 'https://json.schemastore.org/swcrc',
            jsc: {
              parser: {
                syntax: 'typescript',
                tsx: true,
                decorators: true,
              },
              transform: {
                react: {
                  runtime: 'automatic',
                },
              },
              target: 'es5',
              loose: true,
              externalHelpers: true,
            },
            module: {
              type: 'commonjs',
            },
            minify: false,
          },
          [swcEsm]: {
            $schema: 'https://json.schemastore.org/swcrc',
            jsc: {
              parser: {
                syntax: 'typescript',
                tsx: true,
                decorators: true,
              },
              transform: {
                react: {
                  runtime: 'automatic',
                },
              },
              target: 'esnext',
              loose: true,
              externalHelpers: true,
            },
            module: {
              type: 'es6',
            },
            minify: false,
          },
        }
      : {},
    {
      [tsDts]: {
        ...(pkg.leaf || pkg.unit
          ? {
              extends: './tsconfig.json',
              compilerOptions: {
                composite: true,
                declaration: true,
                emitDeclarationOnly: true,
                rootDir: './src/main/ts',
                declarationDir: `./${targetDts}`,
                tsBuildInfoFile: `./${targetDts}/.tsbuildinfo`,
              },
            }
          : pkg.tree
          ? {
              compilerOptions: {
                rootDir: './',
              },
              files: [],
            }
          : {}),
        references: getTypeScriptReferences(pkg, topo, tsDts),
      },
    },
    {
      'package.json':
        pkg.leaf || pkg.unit
          ? {
              publishConfig: {
                type: 'module',
                main: `./${targetCjs}/index.cjs`,
                module: `./${targetEsm}/index.mjs`,
                types: `./${targetDts}/index.d.ts`,
                exports: {
                  '.': {
                    require: `./${targetCjs}/index.cjs`,
                    import: `./${targetEsm}/index.mjs`,
                    types: `./${targetDts}/index.d.ts`,
                  },
                },
                files: [
                  `${targetCjs}/**/*`,
                  `${targetEsm}/**/*`,
                  `${targetDts}/**/*`,
                ],
              },
            }
          : {},
    },
  ],
}

const TSCONFIG = '@packasso/tsconfig'

const modules = [TSCONFIG]

program(
  createCommandInstall(install, modules),
  createCommand('build', 'build').action(async (options) => {
    const { cwd, preset } = options
    const { root, queuePackages } = await getTopo({ cwd }, preset)
    await execute(
      [
        cmd('swc', {
          _: ['src'],
          d: `${targetCjsTmp}/src`,
          'source-maps': true,
          'no-swcrc': true,
          'config-file': swcCjs,
        }),
        cmd('swc', {
          _: ['src'],
          d: `${targetEsmTmp}/src`,
          'source-maps': true,
          'no-swcrc': true,
          'config-file': swcEsm,
        }),
      ],
      root.tree ? queuePackages : preset ? root.absPath : root,
    )
    await execute(cmd('tsc', { b: tsDts }), preset ? root.absPath : root)
    await execute(
      [
        cmd('globby-cp', {
          _: [`${targetCjsTmp}/src/main/ts`, targetCjs],
        }),
        cmd('globby-cp', {
          _: [`${targetEsmTmp}/src/main/ts`, targetEsm],
        }),
      ],
      root.tree ? queuePackages : preset ? root.absPath : root,
    )
    await execute(
      cmd('rimraf', {
        _: [`${targetCjsTmp}`, `${targetEsmTmp}`],
      }),
      root.tree ? queuePackages : preset ? root.absPath : root,
    )
    await execute(
      [
        cmd('tsc-esm-fix', {
          target: targetCjs,
          ext: '.cjs',
          fillBlank: true,
        }),
        cmd('tsc-esm-fix', {
          target: targetEsm,
          ext: '.mjs',
          fillBlank: true,
          forceDefaultExport: true,
        }),
      ],
      root.tree ? queuePackages : preset ? root.absPath : root,
    )
  }),
  createCommandClean([
    targetCjs,
    targetEsm,
    targetDts,
    targetCjsTmp,
    targetEsmTmp,
  ]),
  createCommandPurge(
    [
      'build',
      'dist',
      'lib',
      'buildcache',
      '.buildcache',
      '.swcrc',
      'swc.*.json',
      'tsconfig.*.json',
    ],
    modules,
  ),
)
