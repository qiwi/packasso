#!/usr/bin/env node
import {
  cmd,
  createCommand,
  createCommandClean,
  createCommandInstall,
  createCommandPurge,
  createOption,
  execute,
  getJestModuleNameMapper,
  getJestProjects,
  getNodeModules,
  getTopo,
  Install,
  program,
  testCoverageDir,
  testCoverageMergeAndReport,
  testSuffixes,
  TestType,
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
              coverageReporters: ['json', 'lcov', 'html'],
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

const createCommandTest = (
  name: string,
  description: string,
  types: TestType[],
  runner?: string,
) =>
  createCommand(name, description)
    .addOption(createOption('-u', 'update snapshots and screenshots'))
    .action(async (options) => {
      const { cwd, preset, u } = options
      const { root } = await getTopo({ cwd }, preset)
      for (const type of types) {
        await execute(
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
                )})${runner ? '.' : ''}${runner ?? ''}.[jt]s?(x)'`,
              ],
            },
            {
              NODE_OPTIONS: '--experimental-vm-modules',
              NODE_PATH: getNodeModules(),
            },
          ),
          preset ? root.absPath : root,
        )
      }
      await testCoverageMergeAndReport(testCoverageDir, root, preset)
    })

program(
  createCommandInstall(install),
  createCommandClean([`${testCoverageDir}-*-jest`, testCoverageDir]),
  createCommandPurge(['coverage', 'jest.config.*', 'tsconfig.test.json']),
  createCommandTest('jest:test', 'all tests', ['unit', 'it', 'e2e'], 'jest'),
  createCommandTest('jest:test:unit', 'unit tests', ['unit'], 'jest'),
  createCommandTest('jest:test:it', 'integration tests', ['it'], 'jest'),
  createCommandTest('jest:test:e2e', 'end-to-end tests', ['e2e'], 'jest'),
  createCommandTest('test', 'all tests', ['unit', 'it', 'e2e']),
  createCommandTest('test:unit', 'unit tests', ['unit']),
  createCommandTest('test:it', 'integration tests', ['it']),
  createCommandTest('test:e2e', 'end-to-end tests', ['e2e']),
)
