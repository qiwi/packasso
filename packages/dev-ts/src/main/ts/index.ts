import {
  copyFile,
  copyJson,
  copyText,
  Executor,
  getDependencies,
  getPaths,
} from '@qiwi/packasso'

export const executor: Executor = ({ cwd, res, pkg }) => {
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
