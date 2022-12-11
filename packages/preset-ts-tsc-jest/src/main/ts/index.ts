import { execute, Executor } from '@qiwi/packasso'

const modules = [
  '@qiwi/packasso-dev-ts',
  '@qiwi/packasso-build-ts-tsc',
  '@qiwi/packasso-build-resources',
  '@qiwi/packasso-style-eslint-prettier',
  '@qiwi/packasso-test-jest',
  '@qiwi/packasso-release-zx-semrel',
]

export const executor: Executor = async ({ cwd, development }) => {
  await execute(cwd, modules, development)
}
