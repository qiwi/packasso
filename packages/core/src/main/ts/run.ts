import { error } from 'node:console'
import { existsSync, realpathSync } from 'node:fs'
import { dirname, relative, resolve } from 'node:path'
import { argv, env, exit, cwd as pcwd } from 'node:process'

import { gitRoot } from '@antongolub/git-root'
import concurrently, { ConcurrentlyOptions } from 'concurrently'
import { findUp } from 'find-up'
import lodash from 'lodash'
import minimist, { ParsedArgs } from 'minimist'
import { readPackageUp } from 'read-pkg-up'

import { getExtraTopo } from './topo'
import { Context, ExtraPackageEntry, Module } from './types'

export const getModuleName: (path?: string) => Promise<string> = async (
  path = argv[1],
) => {
  const res = await readPackageUp({ cwd: dirname(realpathSync(path)) })
  if (res) {
    return res.packageJson.name
  }
  throw new Error('can`t get module name')
}

export const context: (module: Module) => Promise<Context> = async (module) => {
  const cwd = pcwd()
  const gitRootRes = await gitRoot(cwd)
  if (!gitRootRes) {
    throw new Error('can`t get git root')
  }
  const node_modules = await findUp('node_modules', {
    cwd: dirname(realpathSync(argv[1])),
    type: 'directory',
  })
  if (!node_modules) {
    throw new Error('can`t get node_modules')
  }
  const command = argv[2]
  if (lodash.isNil(command) || lodash.isEmpty(command)) {
    throw new Error('invalid command')
  }
  const root = gitRootRes.toString()
  const args = minimist(argv.slice(3))
  const topo = await getExtraTopo({ cwd: root })
  const pkg =
    Object.values(topo.packages).find(({ absPath }) => absPath === cwd) ||
    topo.root
  const pkgs =
    pkg === topo.root ? topo.queue.map((name) => topo.packages[name]) : []
  return {
    cwd,
    command,
    args,
    pkg,
    pkgs,
    topo,
    root,
    module,
    node_modules,
  }
}

export const execute: (
  commands: string | string[],
  packages: ExtraPackageEntry | ExtraPackageEntry[],
  options?: Partial<ConcurrentlyOptions>,
) => Promise<unknown> = async (commands, packages, options) => {
  await concurrently(
    [commands].flat().flatMap((command) =>
      [packages].flat().flatMap(({ name, absPath: cwd }) => ({
        command,
        name,
        cwd,
      })),
    ),
    {
      prefixColors: ['auto'],
      ...options,
    },
  ).result
}

export const bin: (
  pkg: ExtraPackageEntry,
  root: string,
  module: string,
) => string = (pkg, root, module) => {
  if (env.NODE_ENV === 'development') {
    const path = resolve(
      root,
      'node_modules',
      module,
      'src',
      'main',
      'ts',
      'bin.ts',
    )
    if (existsSync(path)) {
      return `npx tsx ${relative(pkg.absPath, realpathSync(path))}`
    }
  }
  return `npx ${module}`
}

export const cmd: (
  bin: string,
  args?: Partial<ParsedArgs>,
  env?: Record<string, string | number | boolean | undefined>,
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

export const npx: (
  pkg: ExtraPackageEntry,
  root: string,
  module: string,
  command: string,
  args: ParsedArgs,
  options?: Partial<ConcurrentlyOptions>,
) => Promise<unknown> = async (pkg, root, module, command, args, options) =>
  await execute(
    cmd(`${bin(pkg, root, module)} ${command}`, args, {
      NODE_ENV: env.NODE_ENV,
      NPM_CONFIG_YES: env.NPM_CONFIG_YES,
    }),
    pkg,
    options,
  )

export const runWithContext: (context: Context) => Promise<unknown> = async (
  context,
) => {
  const { command, module } = context
  const { modules = [], commands = {} } = module
  for (const module of modules) {
    await runWithContext({
      ...context,
      module: {
        name: module,
        ...(await import(module)),
      },
    })
  }
  if (commands[command]) {
    try {
      await commands[command](context)
    } catch (e) {
      if (e instanceof Error) {
        error(e)
      }
      throw e
    }
  }
}

export const runWithoutContext: (
  module?: Partial<Module>,
) => Promise<unknown> = async ({ commands = {}, modules = [] } = {}) => {
  await runWithContext(
    await context({
      name: await getModuleName(),
      modules,
      commands,
    }),
  )
}

export const run: (module?: Partial<Module>) => void = (module) => {
  runWithoutContext(module)
    .then(() => exit(0))
    .catch(() => exit(1))
}
