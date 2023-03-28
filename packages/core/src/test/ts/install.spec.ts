import { expect } from 'earljs'
import { test } from 'uvu'

import { diffJson } from '../../main/ts/install'

const json = {
  a: 'a',
  b: 'b',
  c: 'c',
  d: ['a', 'b', 'c'],
  e: {
    a: 'a',
    b: 'b',
    c: 'c',
    d: ['a', 'b', 'c'],
  },
  f: {
    a: 'a',
    b: 'b',
    c: 'c',
  },
}

const merge = (json: object) => JSON.parse(JSON.stringify(json))

test('diff json', () => {
  expect(diffJson(json, { a: 'a' })).toEqual(
    merge({
      ...json,
      a: undefined,
    }),
  )
  expect(diffJson(json, { n: 'n' })).toEqual(json)
  expect(diffJson(json, { f: { a: 'a', b: 'b', c: 'c', d: 'd' } })).toEqual(
    merge({ ...json, f: undefined }),
  )
  expect(diffJson(json, { d: ['a'] })).toEqual(
    merge({
      ...json,
      d: ['b', 'c'],
    }),
  )
  expect(diffJson(json, { d: ['a', 'b', 'c', 'n'] })).toEqual(
    merge({
      ...json,
      d: undefined,
    }),
  )
  expect(diffJson(json, { d: ['n'] })).toEqual(json)
  expect(diffJson(json, { e: { a: 'a' } })).toEqual({
    ...json,
    e: merge({
      ...json.e,
      a: undefined,
    }),
  })
  expect(diffJson(json, { e: { n: 'n' } })).toEqual(json)
  expect(diffJson(json, { e: { d: ['a'] } })).toEqual({
    ...json,
    e: merge({
      ...json.e,
      d: ['b', 'c'],
    }),
  })
  expect(diffJson(json, { e: { d: ['a', 'b', 'c', 'n'] } })).toEqual({
    ...json,
    e: merge({
      ...json.e,
      d: undefined,
    }),
  })
  expect(diffJson(json, { e: { n: ['n'] } })).toEqual(json)
})

test.run()
