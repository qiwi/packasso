import { resolve } from 'node:path'

import { NormalizedPackageJson } from 'read-pkg'

import { Config, Module } from './config'
import { copyJson, copyText, dropPath, getResourcesDir } from './copy'
import { execute } from './execute'
import { getDependencies, getPackage, getWorkspaces } from './package'
import { getModuleNameMapper, getProjects } from './test'
import { getPaths, getReferences } from './tsconfig'

export interface Utils {
  pkg: NormalizedPackageJson
  execute: (config: Config) => void
  dropPath: (name: string | string[]) => void
  copyJson: (file: string, data?: object) => void
  copyText: (file: string, data?: object) => void
  getDependencies: () => Record<string, string>
  getWorkspaces: () => Record<string, string>
  getPaths: () => Record<string, string[]>
  getReferences: (tsconfig: string) => { path: string }[]
  getProjects: () => string[]
  getModuleNameMapper: () => Record<string, string>
}

export const getUtils: (
  cwd: string,
  root: string,
  tmp: string,
  development: boolean,
  module: Module,
) => Utils = (cwd, root, tmp, development, module) => {
  const pkg = getPackage(cwd, root)
  const res = getResourcesDir(cwd, root, module.name, development, pkg)
  const drop = module.drop
  return {
    pkg,
    execute: (config) =>
      execute(cwd, root, tmp, development, {
        ...config,
        modules: config.modules.map((module) => ({ ...module, drop })),
      }),
    dropPath: (name) => dropPath(resolve(root, cwd), name),
    copyJson: (file, data) =>
      res.forEach((res) =>
        copyJson(
          res,
          drop && file !== 'package.json'
            ? resolve(root, cwd)
            : resolve(tmp, cwd),
          file,
          drop,
          data,
        ),
      ),
    copyText: (file, data) =>
      res.forEach((res) =>
        copyText(
          res,
          drop ? resolve(root, cwd) : resolve(tmp, cwd),
          file,
          drop,
          data,
        ),
      ),
    getDependencies: () => getDependencies(cwd, root),
    getWorkspaces: () => getWorkspaces(cwd, root),
    getPaths: () => getPaths(cwd, root),
    getReferences: (tsconfig: string) =>
      getReferences(cwd, root, tmp, tsconfig),
    getProjects: () => getProjects(cwd, root, tmp),
    getModuleNameMapper: () => getModuleNameMapper(cwd, root),
  }
}
