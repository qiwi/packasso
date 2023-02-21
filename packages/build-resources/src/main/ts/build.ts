import { BuildModule } from '@packasso/core'

export const build: BuildModule = async () => ({
  commands: [
    ['rimraf target/resources'],
    ['globby-cp src/main/resources target/resources'],
  ],
})
