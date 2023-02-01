import { Executor } from '@packasso/core'

export const executor: Executor = async ({
  copyJson,
  dropPath,
  getReferences,
}) => {
  dropPath('tsconfig.{es5,es6,mjs,esnext}.json')
  copyJson('package.json')
  copyJson('tsconfig.cjs.json', {
    references: getReferences('tsconfig.cjs.json'),
  })
  copyJson('tsconfig.esm.json', {
    references: getReferences('tsconfig.esm.json'),
  })
}
