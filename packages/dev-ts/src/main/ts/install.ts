import { getPaths, InstallModule, PackageType } from '@packasso/core'

export const install: InstallModule = async (pkg, root) => {
  switch (pkg.type) {
    case PackageType.UNIT:
    case PackageType.LEAF: {
      return {
        resources: [
          {
            path: 'tsconfig.json',
            data: {
              compilerOptions: {
                paths: getPaths(pkg.relPath, root),
              },
            },
          },
        ],
      }
    }
    case PackageType.TREE: {
      return {
        remove: ['tsconfig.json'],
      }
    }
  }
}
