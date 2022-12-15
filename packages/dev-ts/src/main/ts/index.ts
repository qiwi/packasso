import { Executor } from '@packasso/core'

export const executor: Executor = async ({ copyText, copyJson, getPaths }) => {
  copyText('LICENSE', {
    year: new Date().getFullYear(),
  })
  copyText('.gitignore')
  copyJson('package.json')
  copyJson('tsconfig.json', {
    compilerOptions: {
      paths: getPaths(),
    },
  })
  copyText('src/main/ts/index.ts')
}
