import {
  cmd,
  Commands,
  ContextInstallData,
  execute,
  getTypeScriptReferences,
  install,
  uninstall,
} from '@packasso/core'

const tsDts = 'tsconfig.dts.json'
const swcCjs = 'swc.cjs.json'
const swcEsm = 'swc.esm.json'

const data: ContextInstallData = ({ pkg, topo }) => [
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
              declarationDir: './target/dts',
              tsBuildInfoFile: './target/dts/.tsbuildinfo',
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
              main: './target/cjs/index.cjs',
              module: './target/esm/index.mjs',
              types: './target/dts/index.d.ts',
              exports: {
                '.': {
                  require: './target/cjs/index.cjs',
                  import: './target/esm/index.mjs',
                  types: './target/dts/index.d.ts',
                },
              },
            },
            files: ['target/cjs/**/*', 'target/esm/**/*', 'target/dts/**/*'],
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
    await execute('rimraf target/cjs target/esm target/dts', [pkg, ...pkgs])
  },
  build: async ({ pkg, pkgs }) => {
    await execute(
      [
        cmd('swc', {
          _: ['src'],
          d: 'target/cjs.tmp/src',
          'source-maps': true,
          'no-swcrc': true,
          'config-file': swcCjs,
        }),
        cmd('swc', {
          _: ['src'],
          d: 'target/esm.tmp/src',
          'source-maps': true,
          'no-swcrc': true,
          'config-file': swcEsm,
        }),
      ],
      pkg.tree ? pkgs : pkg,
    )
    await execute(`tsc -b ${tsDts}`, pkg)
    await execute(
      [
        'globby-cp target/cjs.tmp/src/main/ts target/cjs',
        'globby-cp target/esm.tmp/src/main/ts target/esm',
        'rimraf target/cjs.tmp target/esm.tmp',
      ],
      pkg.tree ? pkgs : pkg,
    )
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
