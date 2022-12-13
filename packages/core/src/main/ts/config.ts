import { cosmiconfig } from 'cosmiconfig'

export const getConfig = async (cwd: string) => {
  const result = await cosmiconfig('packasso').search(cwd)
  return result
    ? Array.isArray(result.config)
      ? result.config
      : [result.config]
    : []
}
