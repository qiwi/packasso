import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { mkdirSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'

import merge, { Options } from 'deepmerge'
import { dequal } from 'dequal'
import { template } from 'lodash-es'
import { NormalizedPackageJson } from 'read-pkg'

import { getModulesDir, getPackage } from './package'

const arrayMerge: Options['arrayMerge'] = (to, from) =>
  [...to, ...from].filter(
    (item, index, array) =>
      array.findIndex((comp) => dequal(comp, item)) === index,
  )

export const getResourcesDir: (
  cwd: string,
  module: string,
  development?: boolean,
  root?: boolean,
  pkg?: NormalizedPackageJson,
) => string = (cwd, module, development, root, pkg = getPackage(cwd)) => {
  const dir = getModulesDir(cwd)
  return resolve(
    dir,
    module,
    ...(development ? ['src', 'main'] : ['target']),
    'resources',
    root ? 'root' : pkg.workspaces ? 'tree' : 'leaf',
  )
}

const readText: (path: string) => string = (path) => {
  try {
    return readFileSync(path, { encoding: 'utf8' })
  } catch {
    return ''
  }
}

const writeText: (path: string, text: string) => void = (path, text) => {
  writeFileSync(
    path,
    [text.replaceAll(/^\n+/g, '').replaceAll(/\n+$/g, ''), ''].join('\n'),
    {
      encoding: 'utf8',
    },
  )
}

const readJson: (path: string) => object = (path) => {
  try {
    return JSON.parse(readText(path))
  } catch {
    return {}
  }
}

const writeJson: (path: string, json: object) => void = (path, json) => {
  writeText(path, JSON.stringify(json, undefined, 2))
}

export const copyJson: (
  from: string,
  to: string,
  file: string,
  extra?: object,
) => void = (from, to, file, extra = {}) => {
  const fromPath = join(from, file.replace(/^\./, ''))
  if (!existsSync(fromPath)) {
    return
  }
  const toPath = join(to, file)
  const toJson = readJson(toPath)
  const fromJson = readJson(fromPath)
  const json = merge.all([toJson, fromJson, extra], { arrayMerge })
  writeJson(toPath, json)
}

export const copyText: (
  from: string,
  to: string,
  file: string,
  extra?: string,
) => void = (from, to, file, extra = '') => {
  const fromPath = join(from, file.replace(/^\./, ''))
  if (!existsSync(fromPath)) {
    return
  }
  const toPath = join(to, file)
  const toText = readText(toPath)
  const fromText = readText(fromPath)
  const text = [toText, fromText, extra]
    .join('\n')
    .split('\n')
    .filter(
      (line, index, lines) =>
        /^\s*$/.test(line) || lines.indexOf(line) === index,
    )
    .join('\n')
    .replaceAll(/\n{3}/g, '\n\n')
  writeText(toPath, text)
}

export const copyFile: (
  from: string,
  to: string,
  file: string,
  data?: object,
) => void = (from, to, file, data = {}) => {
  const fromPath = join(from, file.replace(/^\./, ''))
  if (!existsSync(fromPath)) {
    return
  }
  const toPath = join(to, file)
  mkdirSync(dirname(toPath), {
    recursive: true,
  })
  const compiled = template(readText(fromPath))
  mkdirSync(dirname(toPath), {
    recursive: true,
  })
  writeText(toPath, compiled(data))
}
