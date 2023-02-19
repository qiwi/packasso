import { cosmiconfig } from 'cosmiconfig'
import { isEqual, uniqWith } from 'lodash-es'

export const getConfig: (cwd: string) => Promise<string[]> = async (cwd) => {
  const result = await cosmiconfig('packasso').search(cwd)
  return uniqWith([result?.config || []].flat(), isEqual)
}
