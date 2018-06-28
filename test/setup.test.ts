import { TestFixture, Test, TestCase, Expect } from 'alsatian';
import { TTLCache } from '../src';

type TTL = number|undefined;
type MAX = number|undefined;

@TestFixture()
export class SetupTests {
  @Test()
  @TestCase(undefined)
  @TestCase(0)
  @TestCase(1)
  @TestCase(10)
  @TestCase(Infinity)
  ttlOk(ttl: TTL) {
    Expect(() => new TTLCache({ ttl })).not.toThrow();
  }

  @Test()
  @TestCase(NaN)
  @TestCase(null)
  @TestCase('')
  @TestCase('0')
  @TestCase({})
  @TestCase([])
  @TestCase([0])
  @TestCase([0, 1])
  @TestCase(() => { /**/ })
  @TestCase(-1)
  @TestCase(-10)
  @TestCase(-Infinity)
  ttlFail(ttl: TTL) {
    Expect(() => new TTLCache({ ttl })).toThrow();
  }

  @Test()
  @TestCase(undefined)
  @TestCase(5)
  @TestCase(10)
  @TestCase(Infinity)
  maxOk(max: MAX) {
    Expect(() => new TTLCache({ max })).not.toThrow();
  }

  @Test()
  @TestCase(NaN)
  @TestCase(null)
  @TestCase('')
  @TestCase('0')
  @TestCase({})
  @TestCase([])
  @TestCase([0])
  @TestCase([0, 1])
  @TestCase(() => { /**/ })
  @TestCase(0)
  @TestCase(1)
  @TestCase(-1)
  @TestCase(-10)
  @TestCase(-Infinity)
  maxFail(max: MAX) {
    Expect(() => new TTLCache({ max })).toThrow();
  }
}
