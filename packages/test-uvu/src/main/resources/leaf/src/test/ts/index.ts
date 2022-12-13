import { expect } from 'earljs'
import { test } from 'uvu'

import { foo } from '../../main/ts/index'

test('foo() returns bar', () => {
  expect(foo()).toEqual('bar')
})

test.run()
