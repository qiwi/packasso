import { cosmiconfig } from 'cosmiconfig'
import { CosmiconfigResult } from 'cosmiconfig/dist/types'

export interface Module {
  name: string
  drop: boolean
}

export interface Config {
  modules: Module[]
}

export const mergeConfigs = (configs: Config[]) => {
  return configs.reduce(
    (config, c) => ({
      ...config,
      modules: [...(config.modules || []), ...(c.modules || [])]
        .filter(
          (module, index, modules) =>
            !module.drop ||
            !modules.some((m) => m.name === module.name && !m.drop),
        )
        .filter(
          (module, index, modules) =>
            modules.findIndex((m) => m.name === module.name) === index,
        )
        .sort((a, b) => (a.drop && !b.drop ? -1 : !a.drop && b.drop ? 1 : 0)),
    }),
    { modules: [] },
  )
}

export const normalizeResult = (result: CosmiconfigResult) => {
  return result
    ? Array.isArray(result.config)
      ? result.config
      : [result.config]
    : []
}

export const normalizeConfig: (values: string[]) => Config = (values) => {
  return values.reduce(
    (config: Config, value: string) => {
      const drop = value.startsWith('//')
      const name = drop ? value.slice(2) : value
      return {
        ...config,
        modules: [
          ...config.modules,
          {
            name,
            drop,
          },
        ].sort((a, b) => (a.drop && !b.drop ? -1 : !a.drop && b.drop ? 1 : 0)),
      }
    },
    {
      modules: [],
    } as Config,
  )
}

export const getConfig = async (cwd: string) => {
  const result = await cosmiconfig('packasso').search(cwd)
  return normalizeConfig(normalizeResult(result))
}
