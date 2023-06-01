#!/usr/bin/env node
import {
  cmd,
  createCommand,
  createCommandClean,
  createCommandInstall,
  createCommandPurge,
  createCommandUninstall,
  execute,
  getTopo,
  getTypeScriptReferences,
  Install,
  program,
} from '@packasso/core'

const tsCjs = 'tsconfig.cjs.json'
const tsEsm = 'tsconfig.esm.json'
const targetCjs = 'target/cjs'
const targetEsm = 'target/esm'

const install: Install = {
  data: (pkg, topo) => [
    {
      [tsCjs]: {
        ...(pkg.leaf || pkg.unit
          ? {
              extends: './tsconfig.json',
              compilerOptions: {
                composite: true,
                target: 'es5',
                module: 'commonjs',
                lib: ['esnext'],
                rootDir: './src/main/ts',
                outDir: `./${targetCjs}`,
                tsBuildInfoFile: `./${targetCjs}/.tsbuildinfo`,
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
        references: getTypeScriptReferences(pkg, topo, tsCjs),
      },
    },
    {
      [tsEsm]: {
        ...(pkg.leaf || pkg.unit
          ? {
              extends: './tsconfig.json',
              compilerOptions: {
                composite: true,
                target: 'es2022',
                module: 'es2022',
                rootDir: './src/main/ts',
                outDir: `./${targetEsm}`,
                tsBuildInfoFile: `./${targetEsm}/.tsbuildinfo`,
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
        references: getTypeScriptReferences(pkg, topo, tsEsm),
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
                types: `./${targetEsm}/index.d.ts`,
                exports: {
                  '.': {
                    require: `./${targetCjs}/index.cjs`,
                    import: `./${targetEsm}/index.mjs`,
                    types: `./${targetEsm}/index.d.ts`,
                  },
                },
                files: [`${targetCjs}/**/*`, `${targetEsm}/**/*`],
              },
            }
          : {},
    },
  ],
}

const TSCONFIG = '@packasso/tsconfig'

const modules = [TSCONFIG]

program('@packasso/tsc', 'tsc', [
  createCommandInstall(install, modules),
  createCommandUninstall(install, modules),
  createCommand('build', 'build').action(async (options) => {
    const { cwd, preset } = options
    const { root, queuePackages } = await getTopo({ cwd }, preset)
    await execute(
      cmd('tsc', { b: [tsCjs, tsEsm].join(' ') }),
      preset ? root.absPath : root,
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
  createCommandClean([targetCjs, targetEsm]),
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
])
