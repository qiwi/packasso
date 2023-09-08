import { cmd, execute } from './run'
import { ExtraTopoContext } from './types'

export type TestType = 'unit' | 'it' | 'e2e'

export const testSuffixes: Record<TestType, string[]> = {
  unit: ['spec', 'test'],
  it: ['it'],
  e2e: ['e2e'],
}

export const testCoverageDir = 'target/coverage'

const testCoverageJson = 'coverage-final.json'
const testCoverageMergeCmd = 'istanbul-merge'
const testCoverageReportCmd = 'nyc report'

export const testCoverageMergeAndReport = async (
  topo: ExtraTopoContext,
  types: TestType[],
  runner: string,
  preset?: string,
) => {
  const { root, queuePackages } = topo
  await execute(
    [
      ...types.map((type) =>
        cmd(testCoverageMergeCmd, {
          _: `${testCoverageDir}-${type}-${runner}/${testCoverageJson}`,
          out: `${testCoverageDir}-${type}/${testCoverageJson}`,
        }),
      ),
      cmd(testCoverageMergeCmd, {
        _: `${testCoverageDir}-*/${testCoverageJson}`,
        out: `${testCoverageDir}/${testCoverageJson}`,
      }),
    ],
    root.tree ? queuePackages : preset ? root.absPath : root,
  )
  await execute(
    [
      ...types.map((type) =>
        cmd(testCoverageReportCmd, {
          t: `${testCoverageDir}-${type}`,
          reporter: ['lcov'],
          'report-dir': `${testCoverageDir}-${type}`,
        }),
      ),
      cmd(testCoverageReportCmd, {
        t: testCoverageDir,
        reporter: ['lcov'],
        'report-dir': testCoverageDir,
      }),
    ],
    root.tree ? queuePackages : preset ? root.absPath : root,
  )
  if (root.tree) {
    await execute(
      [
        ...types.map((type) =>
          cmd(testCoverageMergeCmd, {
            _: queuePackages.flatMap(
              (pkg) =>
                `${pkg.relPath}/${testCoverageDir}-${type}/${testCoverageJson}`,
            ),
            out: `${testCoverageDir}-${type}/${testCoverageJson}`,
          }),
        ),
        cmd(testCoverageMergeCmd, {
          _: queuePackages.flatMap(
            (pkg) => `${pkg.relPath}/${testCoverageDir}/${testCoverageJson}`,
          ),
          out: `${testCoverageDir}/${testCoverageJson}`,
        }),
      ],
      preset ? root.absPath : root,
    )
    await execute(
      [
        ...types.map((type) =>
          cmd(testCoverageReportCmd, {
            t: `${testCoverageDir}-${type}`,
            reporter: ['lcov'],
            'report-dir': `${testCoverageDir}-${type}`,
          }),
        ),
        cmd(testCoverageReportCmd, {
          t: testCoverageDir,
          reporter: ['lcov'],
          'report-dir': testCoverageDir,
        }),
      ],
      preset ? root.absPath : root,
    )
  }
}
