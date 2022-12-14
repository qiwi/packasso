import { existsSync } from 'node:fs'
import { join } from 'node:path'

import { NormalizedPackageJson } from 'read-pkg'

import { copyFile, copyJson, copyText, getResourcesDir } from './copy'
import { getDependencies, getPackage, getWorkspaces } from './package'
import { getModuleNameMapper } from './test'
import { getPaths, getReferences } from './tsconfig'

export interface Context {
  cwd: string
  development?: boolean
  root?: boolean
  pkg: NormalizedPackageJson
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

export const getContext: (
  cwd: string,
  module: string,
  development?: boolean,
  root?: boolean,
) => Context = (cwd, module, development, root) => {
  const pkg = getPackage(cwd)
  const res = getResourcesDir(cwd, module, development, root, pkg)
  return {
    cwd,
    development,
    root,
    pkg,
    copyFile: (file, data) => copyFile(res, cwd, file, data),
    copyJson: (file, data) => copyJson(res, cwd, file, data),
    copyText: (file, data) => copyText(res, cwd, file, data),
    getDependencies: () => getDependencies(cwd),
    getWorkspaces: () => getWorkspaces(cwd),
    getPaths: () => getPaths(cwd),
    getReferences: (tsconfig: string) => getReferences(cwd, tsconfig),
    getModuleNameMapper: () => getModuleNameMapper(cwd),
    copyMissedFile: (file, data) =>
      !existsSync(join(cwd, file)) && copyFile(res, cwd, file, data),
  }
}
