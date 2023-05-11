import { bin, cmd, Commands, execute } from '@packasso/core'

export const commands: Commands = {
  test: async (context) => {
    const paths = context.pkgs.map(({ relPath }) => relPath)
    const many = paths.length > 1
    const mainPaths = `${
      context.pkg.tree
        ? `${many ? '{' : ''}${paths.join(',')}${many ? '}' : ''}/`
        : ''
    }src/main/{ts,js}`
    const testPaths = `${
      context.pkg.tree
        ? `${many ? '(' : ''}${paths.join('|')}${many ? ')' : ''}/`
        : ''
    }src/test/[jt]s/.*.(spec|test).[jt]sx?`
    await execute(
      cmd(
        bin('c8', context),
        {
          all: true,
          o: 'target/coverage',
          r: ['html', 'text', 'lcov'],
          n: `'${mainPaths}'`,
          _: [
            cmd(bin('uvu', context), {
              r: ['tsm', 'earljs/uvu'],
              _: ['.', `'${testPaths}'`],
            }),
          ],
        },
        context.args.u ? { UPDATE_SNAPSHOTS: true } : {},
      ),
      context.pkg,
    )
  },
  clean: async (context) => {
    await execute(cmd(bin('rimraf', context), { _: ['target/coverage'] }), [
      context.pkg,
      ...context.pkgs,
    ])
  },
  purge: async (context) => {
    await execute(
      cmd(bin('rimraf', context), {
        _: ['coverage', 'jest.config.*', 'tsconfig.test.json'],
      }),
      [context.pkg, ...context.pkgs],
    )
  },
}
