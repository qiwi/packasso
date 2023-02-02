import { NormalizedPackageJson } from 'read-pkg'

import { Config, Module } from './config'
import { copyJson, copyText, dropPath, getResourcesDir } from './copy'
import { execute } from './execute'
import { getDependencies, getPackage, getWorkspaces } from './package'
import { getModuleNameMapper } from './test'
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
  getModuleNameMapper: () => Record<string, string>
}

export const getUtils: (
  cwd: string,
  root: string,
  development: boolean,
  module: Module,
) => Utils = (cwd, root, development, module) => {
  const pkg = getPackage(cwd)
  const res = getResourcesDir(cwd, module.name, development, root, pkg)
  const drop = module.drop
  return {
    pkg,
    execute: (config) =>
      execute(cwd, root, development, {
        ...config,
        modules: config.modules.map((module) => ({ ...module, drop })),
      }),
    dropPath: (name) => dropPath(cwd, name),
    copyJson: (file, data) =>
      res.forEach((res) => copyJson(res, cwd, file, drop, data)),
    copyText: (file, data) =>
      res.forEach((res) => copyText(res, cwd, file, drop, data)),
    getDependencies: () => getDependencies(cwd),
    getWorkspaces: () => getWorkspaces(cwd),
    getPaths: () => getPaths(cwd),
    getReferences: (tsconfig: string) => getReferences(cwd, tsconfig),
    getModuleNameMapper: () => getModuleNameMapper(cwd),
  }
}
