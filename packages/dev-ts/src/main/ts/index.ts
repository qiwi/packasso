import { Executor } from '@packasso/core'

export const executor: Executor = async ({
  copyText,
  copyJson,
  dropPath,
  getPaths,
}) => {
  dropPath([
    'tsconfig.json',
    'build',
    'dist',
    'lib',
    'coverage',
    'buildcache',
    '.buildcache',
  ])
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
}
