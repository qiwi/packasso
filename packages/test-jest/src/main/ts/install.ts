import {
  getModuleNameMapper,
  getProjects,
  ModuleInstall,
  PackageType,
} from '@packasso/core'

export const install: ModuleInstall = async (pkg, root) => [
  {
    path: 'jest.config.json',
    data:
      pkg.type === PackageType.TREE
        ? {
            projects: getProjects(pkg.relPath, root),
          }
        : {
            displayName: pkg.name,
            moduleNameMapper: getModuleNameMapper(pkg.relPath, root),
          },
  },
]
