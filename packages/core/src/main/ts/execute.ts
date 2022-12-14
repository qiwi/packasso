import { getUtils, Utils } from './utils'

export interface Executor {
  (utils: Utils): Promise<unknown>
}

export const execute: (
  cwd: string,
  root: string,
  development: boolean,
  modules: string[],
) => Promise<unknown> = async (cwd, root, development, modules) => {
  for (const module of modules) {
    const { executor } = (await import(module)) as { executor: Executor }
    await executor(getUtils(cwd, root, development, module))
  }
}
