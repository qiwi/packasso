import { ModuleCommand, PackageType } from '@packasso/core'

export const lint: ModuleCommand = async (pkg, pkgs) => [
  `! prettier --loglevel warn --check ${
    pkg.type === PackageType.TREE
      ? pkgs.map(({ relPath }) => `${relPath}/src`).join(' ')
      : 'src'
  }`,
]
