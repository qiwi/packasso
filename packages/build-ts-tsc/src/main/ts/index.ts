import { Executor } from '@packasso/core'

export const executor: Executor = async ({ copyJson, getReferences }) => {
  copyJson('package.json')
  copyJson('tsconfig.cjs.json', {
    references: getReferences('tsconfig.cjs.json'),
  })
  copyJson('tsconfig.esm.json', {
    references: getReferences('tsconfig.esm.json'),
  })
}
