import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { mkdirSync, rmSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'

import { diff as diffJson } from 'deep-object-diff'
import fg from 'fast-glob'
import { mergeWith, template } from 'lodash-es'
import { NormalizedPackageJson } from 'read-pkg'

import { getModulesDir, getPackage } from './package'

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

const rm = (path: string) => {
  try {
    rmSync(path, {
      recursive: true,
    })
  } catch {
    //
  }
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
    rm(path)
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

const mergeJson = (json1: object, json2: object) =>
  mergeWith(json1, json2, (objValue, srcValue) => {
    if (Array.isArray(objValue)) {
      return [...objValue, ...srcValue]
    }
  })

export const copyJson: (
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
  const toJson = readJson(toPath)
  const fromJson = mergeJson(readJson(fromPath), data)
  if (drop) {
    if (file === 'package.json') {
      const json = diffJson(fromJson, toJson) as NormalizedPackageJson
      // fix files: [ '2': '/target/...' ]
      if (json.files && !Array.isArray(json.files)) {
        json.files = Object.values(json.files)
      }
      writeJson(toPath, json)
    } else {
      rm(toPath)
    }
  } else {
    const json = mergeJson(toJson, fromJson)
    writeJson(toPath, json)
  }
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
  const toText = readText(toPath)
  const fromText = template(readText(fromPath))(data)
  if (drop) {
    rm(toPath)
  } else {
    const text = [toText, fromText].join('\n')
    writeText(toPath, text)
  }
}

export const dropPath = (cwd: string, pattern: string | string[]) => {
  fg.sync(pattern, {
    cwd,
    deep: 0,
    onlyFiles: false,
    onlyDirectories: false,
  }).forEach((path) => rm(join(cwd, path)))
}
