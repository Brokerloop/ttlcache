import { TestFixture, Test, TestCase, Expect } from 'alsatian';
import { TTLCache } from '../src';

type TTL = number|undefined;

@TestFixture()
export class GetSetTests {
  @Test()
  // @TestCase(0) // flaky
  @TestCase(100)
  getEntry(ttl: TTL) {
    const cache = new TTLCache({ ttl });

    cache.set('a', 123);

    Expect(cache.get('a')).toBe(123);
  }

  @Test()
  @TestCase(50, 0)
  @TestCase(100, 50)
  async getValidEntry(ttl: TTL, waitms: number) {
    const cache = new TTLCache({ ttl });

    cache.set('a', 123);

    await new Promise(resolve => setTimeout(resolve, waitms));

    Expect(cache.get('a')).toBe(123);
  }

  @Test()
  @TestCase(0, 50)
  @TestCase(50, 100)
  async getExpiredEntry(ttl: TTL, waitms: number) {
    const cache = new TTLCache({ ttl });

    cache.set('a', 123);

    await new Promise(resolve => setTimeout(resolve, waitms));

    Expect(cache.get('a')).toBe(undefined);
  }

  @Test()
  flowSimpleKey() {
    const cache = new TTLCache();

    cache.set('a', 123);

    Expect(cache.size).toBe(1);

    cache.set('a', 456);

    Expect(cache.size).toBe(1);

    cache.set('b', 123);

    Expect(cache.size).toBe(2);

    cache.delete('a');

    Expect(cache.size).toBe(1);

    cache.clear();

    Expect(cache.size).toBe(0);
  }

  @Test()
  flowObjectKey() {
    const cache = new TTLCache();

    const obj1 = {};
    const obj2 = {};

    cache.set(obj1, 123);

    Expect(cache.size).toBe(1);

    cache.set(obj1, 456);

    Expect(cache.size).toBe(1);

    cache.set(obj2, 123);

    Expect(cache.size).toBe(2);

    cache.delete(obj1);

    Expect(cache.size).toBe(1);

    cache.clear();

    Expect(cache.size).toBe(0);
  }

  @Test()
  @TestCase(0)
  @TestCase(null)
  @TestCase(undefined)
  @TestCase('')
  @TestCase({})
  @TestCase([])
  @TestCase([0, 1])
  @TestCase(new TTLCache())
  compareValues(val: any) {
    const cache = new TTLCache();

    cache.set('a', val);

    Expect(cache.get('a')).toBe(val);
  }

  @Test()
  compareNaN() {
    const cache = new TTLCache();

    cache.set('a', NaN);

    Expect(Number.isNaN(cache.get('a'))).toBe(true);
  }

  @Test()
  getMissingKey() {
    const cache = new TTLCache();

    cache.set('a', 123);

    Expect(cache.get('b')).toBe(undefined);
  }

  @Test()
  deleteValue() {
    const cache = new TTLCache();

    cache.set('a', 123);

    Expect(cache.delete('a')).toEqual(123);

    Expect(cache.delete('a')).toBe(undefined);
  }

  @Test()
  hasEntry() {
    const cache = new TTLCache();

    Expect(cache.has('a')).toBe(false);

    cache.set('a', 123);

    Expect(cache.has('a')).toBe(true);

    cache.delete('a');

    Expect(cache.has('a')).toBe(false);
  }
}
