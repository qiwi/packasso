#!/usr/bin/env node
import {
  createCommandInstall,
  createCommandPurge,
  Install,
  program,
} from '@packasso/core'

const install: Install = {
  data: (pkg) => [
    pkg.leaf || pkg.unit
      ? {
          '.browserslistrc': [
            '[production]',
            '> 0.2%',
            'not dead',
            'not op_mini all',
            '',
            '[development]',
            'last 1 chrome version',
            'last 1 firefox version',
            'last 1 safari version',
            '',
          ].join('\n'),
        }
      : {},
  ],
}

program(createCommandInstall(install), createCommandPurge(['.browserslistrc']))
