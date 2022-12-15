import { Executor, normalizeConfig } from '@packasso/core'

export const executor: Executor = async ({ execute }) => {
  await execute(
    normalizeConfig([
      '@packasso/dev-ts',
      '@packasso/build-ts-tsc',
      '@packasso/build-resources',
      '@packasso/style-eslint-prettier',
      '@packasso/test-jest',
      '@packasso/release-zx-semrel',
    ]),
  )
}
