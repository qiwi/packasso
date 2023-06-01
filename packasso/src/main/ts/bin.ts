#!/usr/bin/env node
import { exit } from 'node:process'

import {
  createArgument,
  createOptionCwd,
  createProgram,
  getTopo,
  run,
} from '@packasso/core'

createProgram()
  .addArgument(createArgument('<command>', 'preset command to execute'))
  .addOption(createOptionCwd())
  .action(async (command, options, context) => {
    const { cwd } = options
    const { root } = await getTopo({ cwd })
    await run(root, root.modules, command, undefined, context)
  })
  .parseAsync()
  .then(() => exit(0))
  .catch(() => exit(1))
