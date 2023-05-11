import {
  bin,
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
const targetCjs = 'target/cjs'
const targetEsm = 'target/esm'
const targetDts = 'target/dts'

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
]

export const commands: Commands = {
  install: async (context) => {
    await install(data, [], context)
  },
  uninstall: async (context) => {
    await uninstall(data, [], context)
  },
  clean: async (context) => {
    await execute(
      cmd(bin('rimraf', context), {
        _: [targetCjs, targetEsm, targetDts],
      }),
      [context.pkg, ...context.pkgs],
    )
  },
  build: async (context) => {
    await execute(
      [
        cmd(bin('swc', context), {
          _: ['src'],
          d: `${targetCjs}.tmp/src`,
          'source-maps': true,
          'no-swcrc': true,
          'config-file': swcCjs,
        }),
        cmd(bin('swc', context), {
          _: ['src'],
          d: `${targetEsm}.tmp/src`,
          'source-maps': true,
          'no-swcrc': true,
          'config-file': swcEsm,
        }),
      ],
      context.pkg.tree ? context.pkgs : context.pkg,
    )
    await execute(cmd(bin('tsc', context), { b: tsDts }), context.pkg)
    await execute(
      [
        cmd(bin('globby-cp', context), {
          _: [`${targetCjs}.tmp/src/main/ts`, targetCjs],
        }),
        cmd(bin('globby-cp', context), {
          _: [`${targetEsm}.tmp/src/main/ts`, targetEsm],
        }),
        cmd(bin('rimraf', context), {
          _: [`${targetCjs}.tmp`, `${targetEsm}.tmp`],
        }),
      ],
      context.pkg.tree ? context.pkgs : context.pkg,
    )
    await execute(
      [
        cmd(bin('tsc-esm-fix', context), {
          target: targetCjs,
          ext: '.cjs',
          fillBlank: true,
        }),
        cmd(bin('tsc-esm-fix', context), {
          target: targetEsm,
          ext: '.mjs',
          fillBlank: true,
          forceDefaultExport: true,
        }),
      ],
      context.pkg.tree ? context.pkgs : context.pkg,
    )
  },
  purge: async (context) => {
    await execute(
      cmd(bin('rimraf', context), {
        _: [
          'build',
          'dist',
          'lib',
          'buildcache',
          '.buildcache',
          '.swcrc',
          'swc.*.json',
          'tsconfig.*.json',
        ],
      }),
      [context.pkg, ...context.pkgs],
    )
  },
}
