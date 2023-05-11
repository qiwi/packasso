import {
  bin,
  cmd,
  Commands,
  ContextInstallData,
  execute,
  getTypeScriptPaths,
  install,
  uninstall,
} from '@packasso/core'

const data: ContextInstallData = ({ pkg, topo }) => [
  pkg.leaf || pkg.unit
    ? {
        'tsconfig.json': {
          compilerOptions: {
            module: 'es2022',
            target: 'es2022',
            moduleResolution: 'node',
            jsx: 'react-jsx',
            strict: true,
            skipLibCheck: true,
            esModuleInterop: true,
            isolatedModules: true,
            resolveJsonModule: true,
            removeComments: true,
            importHelpers: true,
            baseUrl: './',
            types: ['node'],
            paths: getTypeScriptPaths(pkg, topo),
          },
          include: ['./src/main/ts'],
          exclude: ['./node_modules'],
        },
      }
    : {},
]

const deps = ['typescript']

export const commands: Commands = {
  install: async (context) => {
    await install(data, deps, context)
  },
  uninstall: async (context) => {
    await uninstall(data, deps, context)
  },
  purge: async (context) => {
    await execute(cmd(bin('rimraf', context), { _: ['tsconfig.json'] }), [
      context.pkg,
      ...context.pkgs,
    ])
  },
}
