import { existsSync, realpathSync } from 'node:fs'
import { relative, resolve } from 'node:path'

import { Command } from '@commander-js/extra-typings'
import lodash from 'lodash'

import concurrently, { ConcurrentlyOptions } from './concurrently'
import { getPackageJson, getRoot } from './helpers'
import { ExtraPackageEntry } from './types'

export const execute: (
  commands:
    | string
    | string[]
    | ((cwd: string) => string)
    | ((cwd: string) => string)[],
  packages: (ExtraPackageEntry | string) | (ExtraPackageEntry | string)[],
  options?: Partial<ConcurrentlyOptions>,
) => Promise<unknown> = async (commands, packages, options) => {
  await concurrently(
    [commands].flat().flatMap((command) =>
      [packages].flat().flatMap((pkg) => ({
        command: lodash.isString(command)
          ? command
          : command(lodash.isString(pkg) ? pkg : pkg.absPath),
        name: lodash.isString(pkg) ? undefined : pkg.name,
        cwd: lodash.isString(pkg) ? pkg : pkg.absPath,
      })),
    ),
    {
      prefixColors: ['auto'],
      prefix:
        lodash.isString(packages) || lodash.every(packages, lodash.isString)
          ? 'none'
          : 'name',
      ...options,
    },
  ).result
}

export const npx: (module: string, cwd: string) => string = (module, cwd) => {
  const { devDependencies = {} } = getPackageJson()
  const at = module.indexOf('@', module.startsWith('@') ? 1 : 0)
  const name = at === -1 ? module : module.slice(0, at)
  const version =
    at === -1 ? devDependencies[name] || 'latest' : module.slice(at + 1)
  if (version.startsWith('workspace:')) {
    const path = resolve(
      getRoot(cwd),
      'node_modules',
      name,
      'src',
      'main',
      'ts',
      'bin.ts',
    )
    if (existsSync(path)) {
      return `npx tsx ${relative(cwd, realpathSync(path))}`
    }
    throw new Error(`can\`t run ${module}`)
  }
  return `npx ${name}@${version}`
}

export const cmd: (
  bin: string,
  args?: Record<string, unknown>,
  env?: Record<string, unknown>,
) => string = (bin, args = {}, env = {}) =>
  [
    ...Object.entries(env)
      .filter(([key, value]) => !lodash.isNil(key) && !lodash.isNil(value))
      .flatMap(([key, value]) => `${key}=${value}`),
    bin,
    ...Object.entries(args)
      .filter(([key, value]) => !lodash.isNil(key) && !lodash.isNil(value))
      .flatMap(([key, value]) => {
        if (key === '_') {
          return value
        }
        const arg = [key.length === 1 ? '-' : '--', key].join('')
        if (value === true) {
          return arg
        }
        return [value].flat().flatMap((value) => [arg, value])
      }),
  ]
    .join(' ')
    .trim()

export const run = async (
  pkg: string | ExtraPackageEntry,
  modules: string[],
  command: string,
  preset: string | undefined,
  context: Command<unknown[]>,
) => {
  for (const index in modules) {
    try {
      await execute(
        cmd(
          [
            npx(modules[index], lodash.isString(pkg) ? pkg : pkg.absPath),
            command,
            ...lodash.difference(context.args, context.processedArgs),
          ].join(' '),
          {
            cwd: lodash.isString(pkg) ? pkg : pkg.absPath,
            preset: preset || modules[index],
            index,
          },
        ),
        pkg,
      )
    } catch (e) {
      if (preset || modules.length === 1) {
        throw e
      }
    }
  }
}
