import {
  copyFile,
  copyJson,
  copyText,
  Executor,
  getDependencies,
  getModuleNameMapper,
} from '@packasso/core'

export const executor: Executor = ({ cwd, res, pkg }) => {
  const dependencies = getDependencies(cwd, pkg)
  copyJson(res, cwd, 'package.json')
  copyJson(
    res,
    cwd,
    'jest.config.json',
    pkg.workspaces
      ? {}
      : {
          displayName: pkg.name,
          moduleNameMapper: {
            [pkg.name]: '<rootDir>/src/main/ts',
            ...getModuleNameMapper(dependencies),
          },
        },
  )
  copyText(res, cwd, '.gitignore')
  copyFile(res, cwd, 'src/test/ts/index.ts')
}
