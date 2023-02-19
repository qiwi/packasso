import { InstallModule } from '@packasso/core'

export const install: InstallModule = async () => ({
  remove: [
    '.releaserc',
    '.releaserc.{json,yaml,yml,js,cjs}',
    'release.config.{json,yaml,yml,js,cjs}',
  ],
})
