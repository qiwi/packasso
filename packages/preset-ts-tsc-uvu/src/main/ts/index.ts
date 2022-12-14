import { Executor } from '@packasso/core'

export const executor: Executor = async ({ execute }) => {
  await execute([
    '@packasso/dev-ts',
    '@packasso/build-ts-tsc',
    '@packasso/build-resources',
    '@packasso/style-eslint-prettier',
    '@packasso/test-uvu',
    '@packasso/release-zx-semrel',
  ])
}
