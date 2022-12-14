import { expect } from 'earljs'
import { NormalizedPackageJson } from 'read-pkg'
import { test } from 'uvu'

import { getPaths, getReferences } from '../../main/ts/tsconfig'

const dependencies = {
  'package-self': '.',
  'package-child': 'packages/child',
  'package-sibling': '../packages/sibling',
}

test('getPaths', () => {
  expect(getPaths('.', dependencies)).toEqual({
    'package-self': ['./src/main/ts'],
    'package-child': ['./packages/child/src/main/ts'],
    'package-sibling': ['../packages/sibling/src/main/ts'],
  })
})

test('getReferences', () => {
  expect(
    getReferences(
      '.',
      'tsconfig.json',
      {} as NormalizedPackageJson,
      dependencies,
    ),
  ).toEqual([
    { path: './tsconfig.json' },
    { path: './packages/child/tsconfig.json' },
    { path: '../packages/sibling/tsconfig.json' },
  ])
})

test.run()
