import { foo } from '../../main/ts/index'

describe('foo', () => {
  it('foo() returns bar', () => {
    expect(foo()).toBe('bar')
  })
})
