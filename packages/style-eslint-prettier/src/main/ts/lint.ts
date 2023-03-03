import { ModuleCommand, PackageType } from '@packasso/core'

export const lint: ModuleCommand = async (pkg, pkgs) => {
  const paths =
    pkg.type === PackageType.TREE
      ? pkgs.map(({ relPath }) => `${relPath}/src`).join(' ')
      : 'src'
  return [`! eslint ${paths}`, `! prettier --loglevel warn --check ${paths}`]
}
