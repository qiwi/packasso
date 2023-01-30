import { Executor } from '@packasso/core'

export const executor: Executor = async ({
  pkg,
  copyText,
  copyJson,
  getModuleNameMapper,
}) => {
  copyJson('package.json')
  copyJson(
    'jest.config.json',
    pkg.workspaces
      ? {
          projects: (Array.isArray(pkg.workspaces) ? pkg.workspaces : []).map(
            (workspace) => `<rootDir>/${workspace}/jest.config.json`,
          ),
        }
      : {
          displayName: pkg.name,
          moduleNameMapper: getModuleNameMapper(),
        },
  )
  copyText('.gitignore')
  copyText('src/test/resources/__mocks__/style.js')
  copyText('src/test/resources/__mocks__/file.js')
}
