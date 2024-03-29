#!/usr/bin/env node
import {
  createCommandInstall,
  createCommandPurge,
  getTypeScriptPaths,
  Install,
  program,
} from '@packasso/core'

const install: Install = {
  data: (pkg, topo) => [
    pkg.leaf || pkg.unit
      ? {
          'package.json': {
            type: 'module',
            exports: './src/main/ts/index.ts',
          },
          'tsconfig.json': {
            compilerOptions: {
              module: 'es2022',
              target: 'es2022',
              moduleResolution: 'node',
              jsx: 'react-jsx',
              strict: true,
              skipLibCheck: true,
              esModuleInterop: true,
              experimentalDecorators: true,
              emitDecoratorMetadata: true,
              isolatedModules: true,
              resolveJsonModule: true,
              removeComments: false,
              downlevelIteration: true,
              importHelpers: true,
              baseUrl: './',
              types: ['node'],
              paths: getTypeScriptPaths(pkg, topo),
            },
            include: ['./src/main/ts', './src/test/ts'],
            exclude: ['./node_modules'],
          },
        }
      : {},
  ],
  deps: ['typescript', 'tslib'],
}

program(createCommandInstall(install), createCommandPurge(['tsconfig.json']))
