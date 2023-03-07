import { ModuleCommand, PackageType } from '@packasso/core'

export const format: ModuleCommand = async (pkg, pkgs) => [
  `! eslint --fix ${
    pkg.type === PackageType.TREE
      ? pkgs.map(({ relPath }) => `${relPath}/src`).join(' ')
      : 'src'
  }`,
]
