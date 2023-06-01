import {
  existsSync,
  lstatSync,
  mkdirSync,
  readFileSync,
  rmSync,
  symlinkSync,
  unlinkSync,
  writeFileSync,
} from 'node:fs'
import { dirname, resolve } from 'node:path'

import lodash from 'lodash'
import { PackageJson } from 'read-pkg-up'

import { getNodeModules, getRoot } from './helpers'
import { ExtraPackageEntry, InstallData } from './types'

export const installData = async (
  data: InstallData,
  cwd: string,
  uninstall: boolean,
) =>
  data.forEach((data) =>
    Object.entries(data).forEach(([file, data]) => {
      const path = resolve(cwd, file)
      if (lodash.isNil(data)) {
        return
      }
      if (lodash.isString(data)) {
        uninstall ? revertText(path, data) : applyText(path, data)
      } else {
        uninstall ? revertJson(path, data) : applyJson(path, data)
      }
    }),
  )

export const installDeps = async (
  deps: string[],
  cwd: string,
  uninstall: boolean,
) => {
  const node_modules = getNodeModules()
  const root = getRoot(cwd)
  deps.forEach((dep) => {
    const target = resolve(root, 'node_modules', dep)
    const source = resolve(node_modules, dep)
    const existed = existsSync(target)
    const lstat = lstatSync(target, { throwIfNoEntry: false })
    const linked = lstat ? lstat.isSymbolicLink() : false
    if (linked) {
      unlinkSync(target)
    }
    if (!uninstall && (linked || !existed)) {
      symlinkSync(source, target)
    }
  })
}

export const publish = async (pkg: ExtraPackageEntry) => {
  const { publishConfig = {}, ...json } = readJson(
    pkg.manifestPath,
  ) as PackageJson
  const { access, tag, registry, ...publishJson } = publishConfig
  writeJson(pkg.manifestPath, {
    ...json,
    ...publishJson,
    publishConfig: {
      access,
      tag,
      registry,
    },
    scripts: undefined,
  })
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

const mergeText: (...text: string[]) => string = (...text) =>
  lodash
    .uniqWith(text.join('\n').split('\n'), (value1, value2) => {
      if (value1 === '' || value2 === '') {
        return false
      }
      return lodash.isEqual(value1, value2)
    })
    .join('\n')
    .replaceAll(/\n{3,}/g, '\n\n')

const diffText: (text1: string, ...text2: string[]) => string = (
  text1,
  ...text2
) =>
  lodash
    .differenceWith(
      text1.split('\n'),
      text2.join('\n').split('\n'),
      lodash.isEqual,
    )
    .join('\n')

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
  const trim = text.replaceAll(/^\n+/g, '').replaceAll(/\n+$/g, '')
  if (trim.length === 0) {
    rm(path)
  } else {
    writeFileSync(path, trim + '\n', {
      encoding: 'utf8',
    })
  }
}

const applyText: (path: string, ...text: string[]) => void = (path, ...text) =>
  writeText(path, mergeText(readText(path), ...text))

const revertText: (path: string, ...text: string[]) => void = (path, ...text) =>
  writeText(path, diffText(readText(path), ...text))

const readJson: (path: string) => object = (path) => {
  try {
    const json = JSON.parse(readText(path))
    if (lodash.isString(json)) {
      return `"${json}"`
    }
    return json
  } catch {
    return {}
  }
}

const writeJson: (path: string, json: object) => void = (path, json) => {
  const text = JSON.stringify(json, undefined, 2)
  writeText(path, text === '{}' ? '' : text)
}

const applyJson: (path: string, ...json: object[]) => void = (path, ...json) =>
  writeJson(
    path,
    mergeJson(
      readJson(path),
      json.reduce((acc, json) => mergeJson(acc, json), {}),
    ),
  )

const revertJson: (path: string, ...json: object[]) => void = (path, ...json) =>
  writeJson(
    path,
    diffJson(
      readJson(path),
      json.reduce((acc, json) => mergeJson(acc, json), {}),
    ),
  )

const mergeJson = (json1: object, json2: object) =>
  lodash.mergeWith(json1, json2, (value1, value2) => {
    if (lodash.isArray(value1) || lodash.isArray(value2)) {
      return lodash
        .uniqWith([value1, value2].flat(), lodash.isEqual)
        .filter((value) => !lodash.isNil(value))
    }
  })

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const diffJson = (json1: any, json2: any): any =>
  Object.keys(json1).reduce((result, key) => {
    if (lodash.isEqual(json1[key], json2[key])) {
      return result
    }
    if (lodash.isArray(json1[key]) && lodash.isArray(json2[key])) {
      const d = lodash.differenceWith(json1[key], json2[key], lodash.isEqual)
      if (lodash.isEmpty(d)) {
        return result
      }
      return { ...result, [key]: d }
    }
    if (lodash.isObject(json1[key]) && lodash.isObject(json2[key])) {
      const d = diffJson(json1[key], json2[key])
      if (lodash.isEmpty(d)) {
        return result
      }
      return { ...result, [key]: d }
    }
    return { ...result, [key]: json1[key] }
  }, {})
