import { cosmiconfig } from 'cosmiconfig'
import lodash from 'lodash'

export const getConfig: (cwd: string) => Promise<string[]> = async (cwd) => {
  const result = await cosmiconfig('packasso').search(cwd)
  return lodash.uniqWith([result?.config || []].flat(), lodash.isEqual)
}
