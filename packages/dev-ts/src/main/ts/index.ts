import { Executor } from '@packasso/core'

export const executor: Executor = async ({
  copyFile,
  copyText,
  copyJson,
  copyMissedFile,
  getPaths,
}) => {
  copyFile('LICENSE', {
    year: new Date().getFullYear(),
  })
  copyText('.gitignore')
  copyJson('package.json')
  copyJson('tsconfig.json', {
    compilerOptions: {
      paths: getPaths(),
    },
  })
  copyMissedFile('src/main/ts/index.ts')
}
