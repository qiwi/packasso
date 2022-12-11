import {
  copyJson,
  copyText,
  Executor,
  getDependencies,
  getReferences,
  getWorkspaces,
} from '@qiwi/packasso'

export const executor: Executor = ({ cwd, res, pkg }) => {
  const dependencies = pkg.workspaces
    ? getWorkspaces(cwd, pkg)
    : getDependencies(cwd, pkg)
  copyText(res, cwd, '.gitignore')
  copyJson(res, cwd, 'package.json')
  copyJson(res, cwd, 'tsconfig.cjs.json', {
    references: getReferences(cwd, dependencies, 'tsconfig.cjs.json'),
  })
  copyJson(res, cwd, 'tsconfig.esm.json', {
    references: getReferences(cwd, dependencies, 'tsconfig.esm.json'),
  })
}
