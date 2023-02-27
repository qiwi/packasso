import { getReferences, ModuleInstall } from '@packasso/core'

export const install: ModuleInstall = async (pkg, root) => ({
  remove: [
    'build',
    'dist',
    'lib',
    'buildcache',
    '.buildcache',
    'tsconfig.{es5,es6,mjs,esnext,build}.json',
  ],
  resources: [
    {
      path: 'tsconfig.cjs.json',
      data: {
        references: getReferences(pkg.relPath, root, 'tsconfig.cjs.json'),
      },
    },
    {
      path: 'tsconfig.esm.json',
      data: {
        references: getReferences(pkg.relPath, root, 'tsconfig.esm.json'),
      },
    },
  ],
})
