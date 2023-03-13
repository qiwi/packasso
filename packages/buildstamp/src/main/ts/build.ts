import { ModuleCommand } from '@packasso/core'

export const build: ModuleCommand = async () => [
  'buildstamp --out.path=target/buildstamp.json --out.jsonSeparator=double-space --git --docker.imageTag=${IMAGE_TAG:-none} --date.format=iso',
]
