import { ModuleCommand, PackageType } from '@packasso/core'

export const lint: ModuleCommand = async (pkg, pkgs) => ({
  commands:
    pkg.type === PackageType.TREE
      ? [
          {
            command: `eslint ${pkgs
              .map(({ relPath }) => `${relPath}/src`)
              .join(' ')}`,
            cwd: pkg.absPath,
          },
          {
            command: `prettier --loglevel warn --check ${pkgs
              .map(({ relPath }) => `${relPath}/src`)
              .join(' ')}`,
            cwd: pkg.absPath,
          },
        ]
      : ['eslint src', 'prettier --loglevel warn --check src'],
})
