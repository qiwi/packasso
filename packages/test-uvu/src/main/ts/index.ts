import { Executor } from '@packasso/core'

export const executor: Executor = async ({
  copyJson,
  copyText,
  copyMissedFile,
}) => {
  copyJson('package.json')
  copyText('.gitignore')
  copyMissedFile('src/test/ts/index.ts')
}
