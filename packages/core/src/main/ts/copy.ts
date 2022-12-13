import { copyFileSync, existsSync, readFileSync, writeFileSync } from 'node:fs'
import { mkdirSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'

import merge, { Options } from 'deepmerge'
import { dequal } from 'dequal'

import { getModulesDir, getPackage } from './package'

const arrayMerge: Options['arrayMerge'] = (to, from) =>
  [...to, ...from].filter(
    (item, index, array) =>
      array.findIndex((comp) => dequal(comp, item)) === index,
  )

export const getResourcesDir = (
  cwd: string,
  module: string,
  development?: boolean,
  root?: boolean,
) => {
  const pkg = getPackage(cwd)
  const dir = getModulesDir(cwd)
  return resolve(
    dir,
    module,
    ...(development ? ['src', 'main'] : ['target']),
    'resources',
    root ? 'root' : pkg.workspaces ? 'tree' : 'leaf',
  )
}

const readText = (path: string) => {
  try {
    return readFileSync(path, { encoding: 'utf8' })
  } catch {
    return ''
  }
}

const writeText = (path: string, text: string) => {
  writeFileSync(path, [text, ''].join('\n'))
}

const readJson = (path: string) => {
  try {
    return JSON.parse(readText(path))
  } catch {
    return {}
  }
}

const writeJson = (path: string, json: unknown) => {
  writeText(path, JSON.stringify(json, undefined, 2))
}

export const copyJson = (
  from: string,
  to: string,
  file: string,
  extra?: unknown,
) => {
  const fromPath = join(from, file.replace(/^\./, ''))
  if (!existsSync(fromPath)) {
    return
  }
  const toPath = join(to, file)
  const toJson = readJson(toPath)
  const fromJson = readJson(fromPath)
  const json = merge.all([toJson, fromJson, extra || {}], { arrayMerge })
  writeJson(toPath, json)
  return json
}

export const copyText = (
  from: string,
  to: string,
  file: string,
  extra?: string,
) => {
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
    .replaceAll(/^\n+/g, '')
    .replaceAll(/\n{3}/g, '\n\n')
    .replaceAll(/\n+$/g, '')
  writeText(toPath, text)
  return text
}

export const copyFile = (from: string, to: string, file: string) => {
  const fromPath = join(from, file.replace(/^\./, ''))
  if (!existsSync(fromPath)) {
    return
  }
  const toPath = join(to, file)
  if (!existsSync(toPath)) {
    mkdirSync(dirname(toPath), {
      recursive: true,
    })
    copyFileSync(fromPath, toPath)
  }
}
