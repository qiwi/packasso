import {
  bin,
  cmd,
  Commands,
  ContextInstallData,
  execute,
  getJestModuleNameMapper,
  getJestProjects,
  install,
  uninstall,
} from '@packasso/core'

const data: ContextInstallData = ({ pkg, topo }) => [
  {
    'jest.config.json':
      pkg.leaf || pkg.unit
        ? {
            displayName: pkg.name,
            injectGlobals: false,
            clearMocks: true,
            resetMocks: true,
            testEnvironment: '@packasso/jest-environment-jsdom',
            testMatch: ['<rootDir>/src/test/[jt]s/**/*.(spec|test).[jt]s?(x)'],
            testPathIgnorePatterns: ['__mocks__', '__snapshots__'],
            collectCoverage: true,
            collectCoverageFrom: ['<rootDir>/src/main/[jt]s/**/*.[jt]s?(x)'],
            coverageDirectory: '<rootDir>/target/coverage',
            coveragePathIgnorePatterns: [
              '<rootDir>/node_modules',
              '<rootDir>/target',
            ],
            coverageProvider: 'v8',
            snapshotResolver: '@packasso/jest-snapshot-resolver',
            moduleNameMapper: getJestModuleNameMapper(pkg, topo),
            transform: {
              '^.+\\.svg$': '@packasso/jest-svgr-transformer',
              '^.+\\.[jt]sx?$': [
                '@swc/jest',
                {
                  jsc: {
                    transform: {
                      react: {
                        runtime: 'automatic',
                      },
                    },
                  },
                },
              ],
            },
            transformIgnorePatterns: [],
          }
        : {
            collectCoverage: true,
            collectCoverageFrom: ['<rootDir>/src/main/[jt]s/**/*.[jt]s?(x)'],
            coverageDirectory: '<rootDir>/target/coverage',
            coveragePathIgnorePatterns: [
              '<rootDir>/node_modules',
              '<rootDir>/target',
            ],
            projects: getJestProjects(pkg, topo),
          },
  },
]

const deps = ['@jest']

export const commands: Commands = {
  install: async (context) => {
    await install(data, deps, context)
  },
  uninstall: async (context) => {
    await uninstall(data, deps, context)
  },
  test: async (context) => {
    await execute(
      cmd(
        bin('jest', context),
        {
          silent: true,
          u: context.args.u,
        },
        {
          NODE_PATH: context.node_modules,
        },
      ),
      context.pkg,
    )
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
