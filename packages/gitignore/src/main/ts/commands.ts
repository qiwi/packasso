import {
  Commands,
  ContextInstallData,
  execute,
  install,
  uninstall,
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

const data: ContextInstallData = ({ pkg }) => [
  pkg.tree || pkg.unit
    ? {
        '.gitignore': gitignoreRoot,
      }
    : {},
  {
    '.gitignore': gitignore,
  },
]

export const commands: Commands = {
  install: async (context) => {
    await install(data, [], context)
  },
  uninstall: async (context) => {
    await uninstall(data, [], context)
  },
  purge: async ({ pkg, pkgs }) => {
    await execute('rimraf .gitignore', [pkg, ...pkgs])
  },
}
