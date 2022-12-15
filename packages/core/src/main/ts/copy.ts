import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { mkdirSync, rmSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'

import { diff as diffJson } from 'deep-object-diff'
import merge, { Options } from 'deepmerge'
import { dequal } from 'dequal'
import { diffLines } from 'diff'
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
  development: boolean,
  root: string,
  pkg?: NormalizedPackageJson,
) => string[] = (cwd, module, development, root, pkg = getPackage(cwd)) => {
  const res = resolve(
    getModulesDir(cwd),
    module,
    ...(development ? ['src', 'main'] : ['target']),
    'resources',
  )
  return [
    ...(root === cwd ? [join(res, 'root')] : []),
    join(res, pkg.workspaces ? 'tree' : 'leaf'),
  ]
}

const readText: (path: string) => string = (path) => {
  try {
    return readFileSync(path, { encoding: 'utf8' })
  } catch {
    return ''
  }
}

const writeText: (path: string, text: string) => void = (path, text) => {
  mkdirSync(dirname(path), {
    recursive: true,
  })
  const trimmed = text.replaceAll(/^\n+/g, '').replaceAll(/\n+$/g, '')
  if (trimmed.length === 0) {
    try {
      rmSync(path)
    } catch {
      //
    }
  } else {
    writeFileSync(path, [trimmed, ''].join('\n'), {
      encoding: 'utf8',
    })
  }
}

const readJson: (path: string) => object = (path) => {
  try {
    return JSON.parse(readText(path))
  } catch {
    return {}
  }
}

const writeJson: (path: string, json: object) => void = (path, json) => {
  const text = JSON.stringify(json, undefined, 2)
  writeText(path, text === '{}' ? '' : text)
}

export const copyJson: (
  from: string,
  to: string,
  file: string,
  drop: boolean,
  extra?: object,
) => void = (from, to, file, drop, extra = {}) => {
  const fromPath = join(from, file.replace(/^\./, ''))
  if (!existsSync(fromPath)) {
    return
  }
  const toPath = join(to, file)
  const toJson = readJson(toPath)
  const fromJson = merge.all([readJson(fromPath), extra], { arrayMerge })
  const json = drop
    ? diffJson(fromJson, toJson)
    : merge.all([toJson, fromJson], { arrayMerge })
  writeJson(toPath, json)
}

export const copyText: (
  from: string,
  to: string,
  file: string,
  drop: boolean,
  data?: object,
) => void = (from, to, file, drop, data = {}) => {
  const fromPath = join(from, file.replace(/^\./, ''))
  if (!existsSync(fromPath)) {
    return
  }
  const toPath = join(to, file)
  const toExists = existsSync(toPath)
  const toText = readText(toPath)
  const toEmpty = toText.trim().length === 0
  const fromText = template(readText(fromPath))(data)
    .split('\n')
    .filter((line) => drop || !line.startsWith('//') || !toExists || toEmpty)
    .map((line) =>
      line.startsWith('// ')
        ? line.slice(3)
        : line.startsWith('//')
        ? line.slice(2)
        : line,
    )
    .join('\n')
  const lines = drop ? diffLines(fromText, toText) : diffLines(toText, fromText)
  const text = lines
    .map((line) => (drop && !line.added ? '' : line.value))
    .join('\n')
    .replaceAll(/\n{3,}/g, '\n\n')
  writeText(toPath, text)
}
