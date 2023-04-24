import {
  Commands,
  ContextInstallData,
  execute,
  getTypeScriptPaths,
  install,
  uninstall,
} from '@packasso/core'

const data: ContextInstallData = ({ pkg, topo }) => [
  pkg.tree || pkg.unit
    ? {
        'package.json': {
          optionalDependencies: {
            typescript: '4.9.5',
          },
        },
      }
    : {},
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

export const commands: Commands = {
  install: async (context) => {
    await install(data, [], context)
  },
  uninstall: async (context) => {
    await uninstall(data, [], context)
  },
  purge: async ({ pkg, pkgs }) => {
    await execute('rimraf tsconfig.json', [pkg, ...pkgs])
  },
}
