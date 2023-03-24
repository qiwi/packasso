#!/usr/bin/env node
import { run } from '@packasso/core'

import { commands } from './commands'
import { modules } from './modules'

run({ commands, modules })
