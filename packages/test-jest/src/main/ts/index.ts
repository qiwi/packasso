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
      ? {}
      : {
          displayName: pkg.name,
          moduleNameMapper: getModuleNameMapper(),
        },
  )
  copyText('.gitignore')
  copyText('src/test/ts/index.ts')
}
