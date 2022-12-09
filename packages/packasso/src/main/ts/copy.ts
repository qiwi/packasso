import { copyFileSync, existsSync, readFileSync, writeFileSync } from 'node:fs'
import { mkdirSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import merge, { Options } from 'deepmerge'
import { dequal } from 'dequal'
import { PackageJson } from 'read-pkg'

const arrayMerge: Options['arrayMerge'] = (to, from) =>
  [...to, ...from].filter(
    (item, index, array) =>
      array.findIndex((comp) => dequal(comp, item)) === index,
  )

export const resources = (url: string, pkg: PackageJson) => {
  return resolve(
    dirname(fileURLToPath(url)),
    '..',
    'resources',
    pkg.workspaces ? 'root' : 'leaf',
  )
}

const getText = (path: string) => {
  try {
    return readFileSync(path, { encoding: 'utf8' })
  } catch {
    return ''
  }
}

const getJSON = (path: string) => {
  try {
    return JSON.parse(getText(path))
  } catch {
    return {}
  }
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
  const toJson = getJSON(toPath)
  const fromJson = getJSON(fromPath)
  const json = merge.all([toJson, fromJson, extra || {}], { arrayMerge })
  writeFileSync(toPath, JSON.stringify(json, undefined, 2))
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
  const toText = getText(toPath)
  const fromText = getText(fromPath)
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
    .replaceAll(/\n+$/g, '\n')
  writeFileSync(toPath, text)
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
