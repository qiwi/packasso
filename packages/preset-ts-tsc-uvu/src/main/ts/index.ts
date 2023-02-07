import { Executor, normalizeConfig } from '@packasso/core'

export const executor: Executor = async ({ execute }) => {
  await execute(
    normalizeConfig([
      '@packasso/dev-license',
      '@packasso/dev-ts',
      '@packasso/build-ts-tsc',
      '@packasso/build-resources',
      '@packasso/style-eslint-prettier',
      '@packasso/test-uvu',
      '@packasso/release-zx-semrel',
    ]),
  )
}
