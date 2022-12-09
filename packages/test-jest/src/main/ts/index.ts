import {
  copyFile,
  copyJson,
  copyText,
  Executor,
  getDependencies,
  getModuleNameMapper,
  resources,
} from '@qiwi/packasso'

export const executor: Executor = ({ cwd, pkg }) => {
  const res = resources(import.meta.url, pkg)
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
