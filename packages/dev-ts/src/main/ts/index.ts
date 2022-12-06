import {
  copyFile,
  copyJson,
  copyText,
  Executor,
  getDependencies,
  getPaths,
  resources,
} from 'packasso'

export const executor: Executor = ({ cwd, pkg }) => {
  const res = resources(import.meta.url, pkg)
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
