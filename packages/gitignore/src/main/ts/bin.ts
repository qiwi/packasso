#!/usr/bin/env node
import {
  createCommandInstall,
  createCommandPurge,
  Install,
  program,
} from '@packasso/core'

const gitignore = `/node_modules
/target
`

const gitignoreRoot = `# misc

.DS_Store
/.idea

# local

*.local

# yarn

/.pnp.*
/.yarn/cache
/.yarn/unplugged
/.yarn/install-state.gz
/yarn-error.log

# open-ssl

*.ca
*.crt
*.csr
*.der
*.kdb
*.org
*.p12
*.pem
*.rnd
*.ssleay
*.smime
`

const install: Install = {
  data: (pkg) => [
    pkg.tree || pkg.unit
      ? {
          '.gitignore': gitignoreRoot,
        }
      : {},
    {
      '.gitignore': gitignore,
    },
  ],
}

program(createCommandInstall(install), createCommandPurge(['.gitignore']))
