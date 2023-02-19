import { getReferences, InstallModule } from '@packasso/core'

export const install: InstallModule = async (pkg, root) => ({
  remove: [
    'build',
    'dist',
    'lib',
    '.swcrc',
    'swc.{mjs,es5,es6}.json',
    'tsconfig.build.json',
  ],
  resources: [
    {
      path: 'tsconfig.dts.json',
      data: {
        references: getReferences(pkg.relPath, root, 'tsconfig.dts.json'),
      },
    },
  ],
})
