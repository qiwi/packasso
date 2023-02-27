import { ModuleCommand, PackageType } from '@packasso/core'

export const format: ModuleCommand = async (pkg, pkgs) => ({
  commands:
    pkg.type === PackageType.TREE
      ? [
          {
            command: `eslint --fix ${pkgs
              .map(({ relPath }) => `${relPath}/src`)
              .join(' ')}`,
            cwd: pkg.absPath,
          },
          {
            command: `prettier --loglevel warn --write ${pkgs
              .map(({ relPath }) => `${relPath}/src`)
              .join(' ')}`,
            cwd: pkg.absPath,
          },
        ]
      : ['eslint --fix src', 'prettier --loglevel warn --write src'],
})
