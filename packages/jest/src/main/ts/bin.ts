#!/usr/bin/env node
import {
  cmd,
  createCommandClean,
  createCommandInstall,
  createCommandPurge,
  createCommandTest,
  execute,
  getJestModuleNameMapper,
  getJestProjects,
  getNodeModules,
  getTopo,
  Install,
  program,
  testCoverageDir,
  testSuffixes,
  testTypes,
} from '@packasso/core'

const install: Install = {
  deps: ['@jest'],
  data: (pkg, topo) => [
    {
      'jest.config.json':
        pkg.leaf || pkg.unit
          ? {
              displayName: pkg.name,
              injectGlobals: false,
              clearMocks: true,
              resetMocks: true,
              testEnvironment: 'node',
              testMatch: ['<rootDir>/src/test/[jt]s/**/*.[jt]s?(x)'],
              testPathIgnorePatterns: ['__mocks__', '__snapshots__'],
              collectCoverage: true,
              collectCoverageFrom: ['<rootDir>/src/main/[jt]s/**/*.[jt]s?(x)'],
              coverageDirectory: `<rootDir>/${testCoverageDir}`,
              coveragePathIgnorePatterns: [
                '<rootDir>/node_modules',
                '<rootDir>/target',
              ],
              coverageProvider: 'v8',
              coverageReporters: ['json', 'lcov'],
              snapshotResolver: '@packasso/jest-snapshot-resolver',
              moduleNameMapper: getJestModuleNameMapper(pkg, topo),
              transform: {
                '^.+\\.svg$': '@packasso/jest-svgr-transformer',
                '^.+\\.[jt]sx?$': [
                  '@swc/jest',
                  {
                    jsc: {
                      parser: {
                        syntax: 'typescript',
                        tsx: true,
                        decorators: true,
                        dynamicImport: true,
                      },
                      transform: {
                        react: {
                          runtime: 'automatic',
                        },
                        legacyDecorator: true,
                        decoratorMetadata: true,
                      },
                    },
                  },
                ],
              },
              extensionsToTreatAsEsm: ['.ts', '.tsx'],
              transformIgnorePatterns: ['/node_modules/'],
            }
          : {
              collectCoverage: true,
              collectCoverageFrom: ['<rootDir>/src/main/[jt]s/**/*.[jt]s?(x)'],
              coverageDirectory: `<rootDir>/${testCoverageDir}`,
              coveragePathIgnorePatterns: [
                '<rootDir>/node_modules',
                '<rootDir>/target',
              ],
              projects: getJestProjects(pkg, topo),
            },
    },
  ],
}

program(
  createCommandInstall(install),
  createCommandClean([
    `${testCoverageDir}-unit-jest`,
    `${testCoverageDir}-it-jest`,
    `${testCoverageDir}-e2e-jest`,
  ]),
  createCommandPurge(['jest.config.*', 'tsconfig.test.json']),
  createCommandTest().action(async (options) => {
    const { cwd, preset, index, u, unit, it, e2e } = options
    const { root, queuePackages } = await getTopo({ cwd }, preset)
    await execute(
      testTypes(unit, it, e2e).map((type) =>
        cmd(
          'jest',
          {
            silent: true,
            passWithNoTests: true,
            detectOpenHandles: true,
            forceExit: true,
            updateSnapshot: u,
            coverageDirectory: `'<rootDir>/${testCoverageDir}-${type}-jest'`,
            testMatch: [
              `'<rootDir>/src/test/[jt]s/**/*.(${testSuffixes[type].join(
                '|',
              )})${index ? '.jest' : ''}.[jt]s?(x)'`,
            ],
          },
          {
            NODE_OPTIONS: '--experimental-vm-modules',
            NODE_PATH: getNodeModules(),
          },
        ),
      ),
      root.tree ? queuePackages : preset ? root.absPath : root,
    )
  }),
)
