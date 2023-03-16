import { basename, dirname, relative, resolve } from 'node:path'

import fg from 'fast-glob'

import {
  applyJson,
  applyText,
  readJson,
  readText,
  revertJson,
  revertText,
} from './copy'
import {
  getModuleResourcesDir,
  loadModule,
  Module,
  ModuleInstallResult,
} from './module'
import { ExtraPackageEntry, getExtraTopo, PackageType } from './topo'

export const install: (
  root: string,
  development: boolean,
  uninstall?: boolean,
) => Promise<unknown> = async (root, development, uninstall = false) => {
  const topo = await getExtraTopo({
    cwd: root,
  })
  for (const name of topo.queue) {
    await installPackage(topo.packages[name], root, development, uninstall)
  }
  await installPackage(topo.root, root, development, uninstall)
}

export const installPackage = async (
  pkg: ExtraPackageEntry,
  root: string,
  development: boolean,
  uninstall: boolean,
) => {
  for (const module of pkg.modules) {
    await installModule(module, pkg, root, development, uninstall)
  }
}

const types: Record<PackageType, string[]> = {
  [PackageType.UNIT]: ['root', 'leaf', 'each'],
  [PackageType.TREE]: ['root', 'tree', 'each'],
  [PackageType.LEAF]: ['leaf', 'each'],
}

const special = (path: string) => {
  const name = basename(path)
  if (name === 'gitignore') {
    return resolve(dirname(path), `.${name}`)
  }
  return path
}

const installModuleCommands = (
  pkg: ExtraPackageEntry,
  uninstall: boolean,
  development: boolean,
  commands: Module['commands'],
) =>
  installModuleResult(pkg, uninstall, {
    path: 'package.json',
    data: {
      scripts: Object.fromEntries(
        Object.keys(commands)
          .filter((command) => commands[command])
          .map((command) => [
            command,
            development ? `yarn packasso ${command}` : `packasso ${command}`,
          ]),
      ),
    },
  })

const installModuleResources = (
  pkg: ExtraPackageEntry,
  uninstall: boolean,
  res: string,
) =>
  types[pkg.type].forEach((type) => {
    const cwd = resolve(res, type)
    installModuleResult(
      pkg,
      uninstall,
      ...fg
        .sync('**/*', {
          cwd,
          dot: true,
          absolute: true,
          onlyFiles: true,
        })
        .map((path) => ({
          path: relative(cwd, special(path)),
          data: (path.endsWith('.json') ? readJson : readText)(path),
        })),
    )
  })

export const installModule = async (
  module: string,
  pkg: ExtraPackageEntry,
  root: string,
  development: boolean,
  uninstall: boolean,
) => {
  const { install, modules, commands } = await loadModule(module)
  installModuleCommands(pkg, uninstall, development, commands)
  installModuleResources(
    pkg,
    uninstall,
    getModuleResourcesDir(module, root, development),
  )
  if (install) {
    installModuleResult(
      pkg,
      uninstall,
      ...((await install(pkg, root, development, uninstall)) || []),
    )
  } else if (modules) {
    for (const module of modules) {
      await installModule(module, pkg, root, development, uninstall)
    }
  }
}

const installModuleResult = (
  pkg: ExtraPackageEntry,
  uninstall: boolean,
  ...result: ModuleInstallResult
) => {
  result.forEach(({ path, data }) => {
    const absPath = resolve(pkg.absPath, path)
    if (typeof data === 'string') {
      uninstall ? revertText(absPath, data) : applyText(absPath, data)
    } else {
      uninstall ? revertJson(absPath, data) : applyJson(absPath, data)
    }
  })
}
