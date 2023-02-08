import { Executor } from '@packasso/core'

export const executor: Executor = async ({
  copyText,
  copyJson,
  dropPath,
  getPaths,
}) => {
  dropPath('tsconfig.json')
  copyText('.gitignore')
  copyJson('package.json')
  copyJson('tsconfig.json', {
    compilerOptions: {
      paths: getPaths(),
    },
  })
}
