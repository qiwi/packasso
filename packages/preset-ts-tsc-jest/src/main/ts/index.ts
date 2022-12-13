import { execute, Executor } from '@packasso/core'

const modules = [
  '@packasso/dev-ts',
  '@packasso/build-ts-tsc',
  '@packasso/build-resources',
  '@packasso/style-eslint-prettier',
  '@packasso/test-jest',
  '@packasso/release-zx-semrel',
]

export const executor: Executor = async ({ cwd, development, root }) => {
  await execute(cwd, modules, development, root)
}
