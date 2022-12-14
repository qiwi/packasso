import { Executor } from '@packasso/core'

export const executor: Executor = ({ copyText, copyJson, getReferences }) => {
  copyText('.gitignore')
  copyJson('package.json')
  copyJson('swc.cjs.json')
  copyJson('swc.esm.json')
  copyJson('tsconfig.dts.json', {
    references: getReferences('tsconfig.dts.json'),
  })
}
