import { ModuleInstall } from '@packasso/core'

export const install: ModuleInstall = async () => ({
  remove: [
    '.releaserc',
    '.releaserc.{json,yaml,yml,js,cjs}',
    'release.config.{json,yaml,yml,js,cjs}',
  ],
})
