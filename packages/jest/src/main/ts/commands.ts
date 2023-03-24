import {
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
            testEnvironment: 'jsdom',
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

export const commands: Commands = {
  install: async (context) => {
    await install(context.pkg, ...data(context))
  },
  uninstall: async (context) => {
    await uninstall(context.pkg, ...data(context))
  },
  test: async ({ pkg, args }) => {
    await execute(cmd('jest', { silent: true, u: args.u }), pkg)
  },
  purge: async ({ pkg, pkgs }) => {
    await execute('rimraf coverage jest.config.* tsconfig.test.json', [
      pkg,
      ...pkgs,
    ])
  },
}
