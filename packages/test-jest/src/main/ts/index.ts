import { Executor } from '@packasso/core'

export const executor: Executor = async ({
  pkg,
  copyText,
  copyJson,
  dropPath,
  getProjects,
  getModuleNameMapper,
}) => {
  dropPath(['jest.config.{js,ts,mjs,cjs}', 'tsconfig.test.json'])
  copyJson('package.json')
  copyJson(
    'jest.config.json',
    pkg.workspaces
      ? {
          projects: getProjects(),
        }
      : {
          displayName: pkg.name,
          moduleNameMapper: getModuleNameMapper(),
        },
  )
  copyText('src/test/resources/__mocks__/style.js')
  copyText('src/test/resources/__mocks__/file.js')
}
