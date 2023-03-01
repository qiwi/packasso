import { basename, dirname, relative, resolve } from 'node:path'

import fg from 'fast-glob'

import {
  applyJson,
  applyText,
  readJson,
  readText,
  revertJson,
  revertText,
  rmGlob,
} from './copy'
import {
  getModuleResourcesDir,
  getModuleVersion,
  loadModule,
  ModuleCommand,
  ModuleInstallResource,
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
  [PackageType.UNIT]: ['root', 'leaf', 'none'],
  [PackageType.TREE]: ['root', 'tree', 'none'],
  [PackageType.LEAF]: ['leaf', 'none'],
}

const special = (path: string) => {
  const name = basename(path)
  if (name === 'gitignore') {
    return resolve(dirname(path), `.${name}`)
  }
  return path
}

export const installModule = async (
  module: string,
  pkg: ExtraPackageEntry,
  root: string,
  development: boolean,
  uninstall: boolean,
) => {
  const { install, build, test, lint, format } = await loadModule(module)
  const res = getModuleResourcesDir(module, root, development)
  const commands: Partial<Record<string, ModuleCommand>> = {
    build,
    test,
    lint,
    format,
  }
  let resources: ModuleInstallResource[] = development
    ? []
    : [
        {
          path: 'package.json',
          data: {
            scripts: Object.fromEntries(
              Object.keys(commands)
                .filter((command) => commands[command])
                .map((command) => [command, `packasso ${command}`]),
            ),
            devDependencies:
              pkg.type === PackageType.TREE
                ? undefined
                : Object.fromEntries(
                    pkg.modules.map((module) => [
                      module,
                      getModuleVersion(module, root),
                    ]),
                  ),
          },
        },
      ]
  types[pkg.type].forEach((type) => {
    const cwd = resolve(res, type)
    fg.sync('**/*', {
      cwd,
      dot: true,
      absolute: true,
      onlyFiles: true,
    }).forEach((path) => {
      resources.push({
        path: relative(cwd, special(path)),
        data: (path.endsWith('.json') ? readJson : readText)(path),
      })
    })
  })
  if (install) {
    const result = await install(pkg, root, development, uninstall)
    resources = [...resources, ...(result?.resources || [])]
    if (result?.remove) {
      result.remove.forEach((pattern) => {
        rmGlob(pkg.absPath, pattern)
      })
    }
  }
  installModuleResources(pkg, uninstall, resources)
}

const installModuleResources = (
  pkg: ExtraPackageEntry,
  uninstall: boolean,
  resources: ModuleInstallResource[],
) => {
  resources.forEach(({ path, data }) => {
    const absPath = resolve(pkg.absPath, path)
    if (typeof data === 'string') {
      uninstall ? revertText(absPath, data) : applyText(absPath, data)
    } else {
      uninstall ? revertJson(absPath, data) : applyJson(absPath, data)
    }
  })
}
