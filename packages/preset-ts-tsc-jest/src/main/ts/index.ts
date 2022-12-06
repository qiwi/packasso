import { Executor, getPackage } from 'packasso'

const modules = [
  'packasso-dev-ts',
  'packasso-build-ts-tsc',
  'packasso-build-resources',
  'packasso-style-eslint-prettier',
  'packasso-test-jest',
  'packasso-release-zx-semrel',
]

export const executor: Executor = async ({ cwd }) => {
  for (const module of modules) {
    const { executor } = await import(module)
    await executor({ cwd, pkg: getPackage(cwd) })
  }
}
