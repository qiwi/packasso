import { cmd, Commands, execute } from '@packasso/core'

export const commands: Commands = {
  test: async ({ pkg, pkgs, args }) => {
    const paths = pkgs.map(({ relPath }) => relPath)
    const many = paths.length > 1
    const mainPaths = `${
      pkg.tree ? `${many ? '{' : ''}${paths.join(',')}${many ? '}' : ''}/` : ''
    }src/main/{ts,js}`
    const testPaths = `${
      pkg.tree ? `${many ? '(' : ''}${paths.join('|')}${many ? ')' : ''}/` : ''
    }src/test/[jt]s/.*.(spec|test).[jt]sx?`
    const u = args.u ? 'UPDATE_SNAPSHOTS=true' : ''
    const c8 = cmd('c8', {
      all: true,
      o: 'target/coverage',
      r: ['html', 'text', 'lcov'],
      n: `'${mainPaths}'`,
    })
    const uvu = cmd('uvu', {
      r: ['tsm', 'earljs/uvu'],
      _: ['.', `'${testPaths}'`],
    })
    await execute(`${u} ${c8} ${uvu}`.trim(), pkg)
  },
  clean: async ({ pkg, pkgs }) => {
    await execute('rimraf target/coverage', [pkg, ...pkgs])
  },
  purge: async ({ pkg, pkgs }) => {
    await execute('rimraf coverage jest.config.* tsconfig.test.json', [
      pkg,
      ...pkgs,
    ])
  },
}
