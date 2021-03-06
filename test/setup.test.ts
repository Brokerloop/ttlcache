import { TestFixture, Test, TestCase, Expect } from 'alsatian';
import { MockClock } from './config';
import { TTLCache, Clock, MIN_SIZE } from '../src';

type TTL = number|undefined;
type MAX = number|undefined;

@TestFixture()
export class SetupTests {
  @Test()
  @TestCase(undefined)
  @TestCase({})
  noOpts(opts: undefined|{}) {
    Expect(() => new TTLCache(opts)).not.toThrow();
  }

  @Test()
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
  @TestCase(MIN_SIZE)
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
  @TestCase(-1)
  @TestCase(-10)
  @TestCase(-Infinity)
  maxFail(max: MAX) {
    Expect(() => new TTLCache({ max })).toThrow();
  }

  @Test()
  @TestCase(Date)
  @TestCase({ now: () => Date.now() })
  @TestCase(new MockClock())
  clockOk(clock: Clock) {
    Expect(() => new TTLCache({ clock })).not.toThrow();
  }

  @Test()
  @TestCase(null)
  @TestCase(undefined)
  clockFail(clock: Clock) {
    Expect(() => new TTLCache({ clock })).toThrow();
  }
}
