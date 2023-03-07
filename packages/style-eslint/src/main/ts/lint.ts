import { ModuleCommand, PackageType } from '@packasso/core'

export const lint: ModuleCommand = async (pkg, pkgs) => [
  `! eslint ${
    pkg.type === PackageType.TREE
      ? pkgs.map(({ relPath }) => `${relPath}/src`).join(' ')
      : 'src'
  }`,
]
