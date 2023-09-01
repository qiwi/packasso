import { deepStrictEqual } from 'node:assert'
import { describe, it } from 'node:test'

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

describe('install', () => {
  it('diff json', () => {
    deepStrictEqual(
      diffJson(json, { a: 'a' }),
      merge({
        ...json,
        a: undefined,
      }),
    )
    deepStrictEqual(diffJson(json, { n: 'n' }), json)
    deepStrictEqual(
      diffJson(json, { f: { a: 'a', b: 'b', c: 'c', d: 'd' } }),
      merge({ ...json, f: undefined }),
    )
    deepStrictEqual(
      diffJson(json, { d: ['a'] }),
      merge({
        ...json,
        d: ['b', 'c'],
      }),
    )
    deepStrictEqual(
      diffJson(json, { d: ['a', 'b', 'c', 'n'] }),
      merge({
        ...json,
        d: undefined,
      }),
    )
    deepStrictEqual(diffJson(json, { d: ['n'] }), json)
    deepStrictEqual(diffJson(json, { e: { a: 'a' } }), {
      ...json,
      e: merge({
        ...json.e,
        a: undefined,
      }),
    })
    deepStrictEqual(diffJson(json, { e: { n: 'n' } }), json)
    deepStrictEqual(diffJson(json, { e: { d: ['a'] } }), {
      ...json,
      e: merge({
        ...json.e,
        d: ['b', 'c'],
      }),
    })
    deepStrictEqual(diffJson(json, { e: { d: ['a', 'b', 'c', 'n'] } }), {
      ...json,
      e: merge({
        ...json.e,
        d: undefined,
      }),
    })
    deepStrictEqual(diffJson(json, { e: { n: ['n'] } }), json)
  })
})
