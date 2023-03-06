import { getReferences, ModuleInstall } from '@packasso/core'

export const install: ModuleInstall = async (pkg, root) => [
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
]
