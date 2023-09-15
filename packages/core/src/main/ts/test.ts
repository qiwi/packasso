export type TestType = 'unit' | 'it' | 'e2e'

export const testSuffixes: Record<TestType, string[]> = {
  unit: ['spec', 'test'],
  it: ['it'],
  e2e: ['e2e'],
}

export const testTypes: (
  unit?: boolean,
  it?: boolean,
  e2e?: boolean,
) => TestType[] = (unit, it, e2e) => {
  return (
    unit || it || e2e
      ? [
          ...(unit ? ['unit'] : []),
          ...(it ? ['it'] : []),
          ...(e2e ? ['e2e'] : []),
        ]
      : ['unit', 'it', 'e2e']
  ) as TestType[]
}

export const testCoverageDir = 'target/coverage'
