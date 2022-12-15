import { Config } from './config'
import { getUtils, Utils } from './utils'

export interface Executor {
  (utils: Utils): Promise<unknown>
}

export const execute: (
  cwd: string,
  root: string,
  development: boolean,
  config: Config,
) => Promise<unknown> = async (cwd, root, development, config) => {
  for (const module of config.modules) {
    const { executor } = (await import(module.name)) as { executor: Executor }
    await executor(getUtils(cwd, root, development, module))
  }
}
