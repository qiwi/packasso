import {
  copyFile,
  copyJson,
  copyText,
  Executor,
  getDependencies,
  getPaths,
} from '@packasso/core'

export const executor: Executor = ({ cwd, res, pkg }) => {
  copyFile(res, cwd, 'LICENSE')
  copyText(res, cwd, '.gitignore')
  copyJson(res, cwd, 'package.json')
  copyJson(res, cwd, 'tsconfig.json', {
    compilerOptions: {
      paths: getPaths({
        [pkg.name]: '.',
        ...getDependencies(cwd, pkg),
      }),
    },
  })
  copyFile(res, cwd, 'src/main/ts/index.ts')
}
