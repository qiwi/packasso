import { installModule, InstallModule } from '@packasso/core'

const modules = [
  '@packasso/dev-license',
  '@packasso/dev-ts',
  '@packasso/build-ts-tsc',
  '@packasso/build-resources',
  '@packasso/style-eslint-prettier',
  '@packasso/test-uvu',
  '@packasso/release-zx-semrel',
]

export const install: InstallModule = async (pkg, root, source, uninstall) => {
  for (const module of modules) {
    await installModule(module, pkg, root, source, uninstall)
  }
}
