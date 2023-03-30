import {
  cmd,
  Commands,
  ContextInstallData,
  execute,
  getTypeScriptReferences,
  install,
  uninstall,
} from '@packasso/core'

const tsCjs = 'tsconfig.cjs.json'
const tsEsm = 'tsconfig.esm.json'

const data: ContextInstallData = ({ pkg, topo }) => [
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
              outDir: './target/cjs',
              tsBuildInfoFile: './target/cjs/.tsbuildinfo',
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
              outDir: './target/esm',
              tsBuildInfoFile: './target/esm/.tsbuildinfo',
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
              main: './target/cjs/index.cjs',
              module: './target/esm/index.mjs',
              types: './target/esm/index.d.ts',
              exports: {
                '.': {
                  require: './target/cjs/index.cjs',
                  import: './target/esm/index.mjs',
                  types: './target/esm/index.d.ts',
                },
              },
            },
            files: ['target/cjs/**/*', 'target/esm/**/*'],
          }
        : {},
  },
]

export const commands: Commands = {
  install: async (context) => {
    await install(data(context), context.pkg)
  },
  uninstall: async (context) => {
    await uninstall(data(context), context.pkg)
  },
  clean: async ({ pkg, pkgs }) => {
    await execute('rimraf target/cjs target/esm', [pkg, ...pkgs])
  },
  build: async ({ pkg, pkgs }) => {
    await execute(`tsc -b ${tsEsm} ${tsCjs}`, pkg)
    await execute(
      [
        cmd('tsc-esm-fix', {
          target: 'target/cjs',
          ext: '.cjs',
          fillBlank: true,
        }),
        cmd('tsc-esm-fix', {
          target: 'target/esm',
          ext: '.mjs',
          fillBlank: true,
          forceDefaultExport: true,
        }),
      ],
      pkg.tree ? pkgs : pkg,
    )
  },
  purge: async ({ pkg, pkgs }) => {
    await execute(
      'rimraf build dist lib buildcache .buildcache .swcrc swc.*.json tsconfig.*.json',
      [pkg, ...pkgs],
    )
  },
}
