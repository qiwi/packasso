import { existsSync } from 'node:fs'
import { join } from 'node:path'

import { copyFile, copyJson, copyText, getResourcesDir } from './copy'
import { execute } from './execute'
import { getDependencies, getPackage, getWorkspaces } from './package'
import { getModuleNameMapper } from './test'
import { getPaths, getReferences } from './tsconfig'

export interface Utils {
  execute: (modules: string[]) => void
  copyFile: (file: string, data?: object) => void
  copyMissedFile: (file: string, data?: object) => void
  copyJson: (file: string, data?: object) => void
  copyText: (file: string, data?: string) => void
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
  module: string,
) => Utils = (cwd, root, development, module) => {
  const pkg = getPackage(cwd)
  const res = getResourcesDir(cwd, module, development, root, pkg)
  return {
    execute: (modules) => execute(cwd, root, development, modules),
    copyFile: (file, data) =>
      res.forEach((res) => copyFile(res, cwd, file, data)),
    copyJson: (file, data) =>
      res.forEach((res) => copyJson(res, cwd, file, data)),
    copyText: (file, data) =>
      res.forEach((res) => copyText(res, cwd, file, data)),
    getDependencies: () => getDependencies(cwd),
    getWorkspaces: () => getWorkspaces(cwd),
    getPaths: () => getPaths(cwd),
    getReferences: (tsconfig: string) => getReferences(cwd, tsconfig),
    getModuleNameMapper: () => getModuleNameMapper(cwd),
    copyMissedFile: (file, data) =>
      !existsSync(join(cwd, file)) &&
      res.forEach((res) => copyFile(res, cwd, file, data)),
  }
}
