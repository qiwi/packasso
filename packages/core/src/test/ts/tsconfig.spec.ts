import { expect } from 'earljs'
import { test } from 'uvu'

import { getPaths } from '../../main/ts/tsconfig'

const dependencies = {
  'package-self': '.',
  'package-child': 'packages/child',
  'package-sibling': '../packages/sibling',
}

test('getPaths', () => {
  expect(getPaths('.', '.', dependencies)).toEqual({
    'package-self': ['./src/main/ts'],
    'package-child': ['./packages/child/src/main/ts'],
    'package-sibling': ['../packages/sibling/src/main/ts'],
  })
})

test.run()
