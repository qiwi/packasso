import { execute, Executor } from '@qiwi/packasso'

const modules = [
  '@qiwi/packasso-dev-ts',
  '@qiwi/packasso-build-ts-swc',
  '@qiwi/packasso-build-resources',
  '@qiwi/packasso-style-eslint-prettier',
  '@qiwi/packasso-test-uvu',
  '@qiwi/packasso-release-zx-semrel',
]

export const executor: Executor = async ({ cwd, development, root }) => {
  await execute(cwd, modules, development, root)
}
