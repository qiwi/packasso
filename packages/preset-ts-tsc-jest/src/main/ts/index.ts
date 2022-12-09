import { Executor, getPackage } from '@qiwi/packasso'

const modules = [
  '@qiwi/packasso-dev-ts',
  '@qiwi/packasso-build-ts-tsc',
  '@qiwi/packasso-build-resources',
  '@qiwi/packasso-style-eslint-prettier',
  '@qiwi/packasso-test-jest',
  '@qiwi/packasso-release-zx-semrel',
]

export const executor: Executor = async ({ cwd }) => {
  for (const module of modules) {
    const { executor } = await import(module)
    await executor({ cwd, pkg: getPackage(cwd) })
  }
}
