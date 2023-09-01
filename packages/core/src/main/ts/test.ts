import { cmd, execute } from './run'
import { ExtraPackageEntry } from './types'

export type TestType = 'unit' | 'it' | 'e2e'

export const testSuffixes: Record<TestType, string[]> = {
  unit: ['spec', 'test'],
  it: ['it'],
  e2e: ['e2e'],
}

export const testCoverageDir = 'target/coverage'

export const testCoverageMergeAndReport = async (
  coverage: string,
  root: ExtraPackageEntry,
  preset?: string,
) => {
  await execute(
    cmd('istanbul-merge', {
      _: `${coverage}-*/coverage-final.json`,
      out: `${coverage}/coverage-final.json`,
    }),
    preset ? root.absPath : root,
  )
  await execute(
    cmd('nyc report', {
      t: coverage,
      reporter: ['lcov', 'html'],
      'report-dir': coverage,
    }),
    preset ? root.absPath : root,
  )
}
