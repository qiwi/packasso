const testDir = 'src/test'
const snapshotsDir = `${testDir}/resources/jest-snapshots`

const resolveSnapshotPath = (path: string, ext: string) =>
  `${path.replace(testDir, snapshotsDir)}${ext}`

const resolveTestPath = (path: string, ext: string) => {
  return path.slice(0, -ext.length).replace(snapshotsDir, testDir)
}

const testPathForConsistencyCheck = 'package/src/test/ts/welcome.spec.tsx'

export default {
  resolveSnapshotPath,
  resolveTestPath,
  testPathForConsistencyCheck,
}
