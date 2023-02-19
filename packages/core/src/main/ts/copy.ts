import { readFileSync, writeFileSync } from 'node:fs'
import { mkdirSync, rmSync } from 'node:fs'
import { dirname } from 'node:path'

import fg from 'fast-glob'
import {
  differenceWith,
  isArray,
  isEqual,
  isNil,
  isObject,
  mergeWith,
  uniqWith,
} from 'lodash-es'

export const rm = (path: string) => {
  try {
    rmSync(path, {
      recursive: true,
    })
  } catch {
    //
  }
}

export const mergeText: (...text: string[]) => string = (...text) =>
  text.join('\n')

export const diffText: (text1: string, ...text2: string[]) => string = (
  text1,
  ...text2
) =>
  differenceWith(text1.split('\n'), text2.join('\n').split('\n'), isEqual).join(
    '\n',
  )

export const readText: (path: string) => string = (path) => {
  try {
    return readFileSync(path, { encoding: 'utf8' })
  } catch {
    return ''
  }
}

export const writeText: (path: string, text: string) => void = (path, text) => {
  mkdirSync(dirname(path), {
    recursive: true,
  })
  const trim = text.replaceAll(/^\n+/g, '').replaceAll(/\n+$/g, '')
  if (trim.length === 0) {
    rm(path)
  } else {
    writeFileSync(path, trim + '\n', {
      encoding: 'utf8',
    })
  }
}

export const applyText: (path: string, ...text: string[]) => void = (
  path,
  ...text
) => writeText(path, mergeText(readText(path), ...text))

export const revertText: (path: string, ...text: string[]) => void = (
  path,
  ...text
) => writeText(path, diffText(readText(path), ...text))

export const readJson: (path: string) => object = (path) => {
  try {
    return JSON.parse(readText(path))
  } catch {
    return {}
  }
}

export const writeJson: (path: string, json: object) => void = (path, json) => {
  const text = JSON.stringify(json, undefined, 2)
  writeText(path, text === '{}' ? '' : text)
}

export const applyJson: (path: string, ...json: object[]) => void = (
  path,
  ...json
) =>
  writeJson(
    path,
    mergeJson(
      readJson(path),
      json.reduce((acc, json) => mergeJson(acc, json), {}),
    ),
  )

export const revertJson: (path: string, ...json: object[]) => void = (
  path,
  ...json
) =>
  writeJson(
    path,
    diffJson(
      readJson(path),
      json.reduce((acc, json) => mergeJson(acc, json), {}),
    ),
  )

export const mergeJson = (json1: object, json2: object) =>
  mergeWith(json1, json2, (value1, value2) => {
    if (Array.isArray(value1) || Array.isArray(value2)) {
      return uniqWith([value1, value2].flat(), isEqual).filter(
        (value) => !isNil(value),
      )
    }
  })

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const diffJson = (json1: any, json2: any): any =>
  Object.keys(json1).reduce((result, key) => {
    if (isEqual(json1[key], json2[key])) {
      return result
    }
    if (Array.isArray(json1[key]) && isArray(json2[key])) {
      const d = differenceWith(json1, json2, isEqual)
      if (d.length === 0) {
        return result
      }
      return { ...result, [key]: d }
    }
    if (isObject(json1[key]) && isObject(json2[key])) {
      const d = diffJson(json1[key], json2[key])
      if (Object.keys(d).length === 0) {
        return result
      }
      return { ...result, [key]: d }
    }
    return { ...result, [key]: json1[key] }
  }, {})

export const rmGlob = (cwd: string, ...pattern: string[]) =>
  fg
    .sync(pattern, {
      cwd,
      absolute: true,
      deep: 0,
      onlyFiles: false,
      onlyDirectories: false,
    })
    .forEach((path) => rm(path))
