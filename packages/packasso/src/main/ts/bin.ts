#!/usr/bin/env node
import { cwd, exit } from 'node:process'

import { main } from './main'

try {
  await main({
    cwd: cwd(),
  })
  exit(0)
} catch (e) {
  console.error(e)
  exit(1)
}
