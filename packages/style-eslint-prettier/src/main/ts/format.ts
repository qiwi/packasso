import { ModuleCommand, PackageType } from '@packasso/core'

export const format: ModuleCommand = async (pkg, pkgs) => {
  const paths =
    pkg.type === PackageType.TREE
      ? pkgs.map(({ relPath }) => `${relPath}/src`).join(' ')
      : 'src'
  return [
    `! eslint --fix ${paths}`,
    `! prettier --loglevel warn --write ${paths}`,
  ]
}
