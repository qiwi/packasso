import { getReferences, ModuleInstall } from '@packasso/core'

export const install: ModuleInstall = async (pkg, root) => [
  {
    path: 'tsconfig.dts.json',
    data: {
      references: getReferences(pkg.relPath, root, 'tsconfig.dts.json'),
    },
  },
]
