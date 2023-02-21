import {
  getModuleNameMapper,
  getProjects,
  InstallModule,
  PackageType,
} from '@packasso/core'

export const install: InstallModule = async (pkg, root) => ({
  remove: ['coverage', 'jest.config.{js,ts,mjs,cjs}', 'tsconfig.test.json'],
  resources: [
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
  ],
})
