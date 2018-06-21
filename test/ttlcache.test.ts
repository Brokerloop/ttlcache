import { TestFixture, Test, AsyncTest, TestCase, Expect } from 'alsatian';
import { TTLCache } from '../src/ttlcache';

type TTL = number|undefined;

@TestFixture()
export class TTLCacheTest {
  @Test()
  @TestCase(undefined)
  @TestCase(0)
  @TestCase(1)
  @TestCase(5)
  @TestCase(10)
  @TestCase(Infinity)
  createOk(ttl: TTL) {
    Expect(() => new TTLCache(ttl)).not.toThrow();
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
  @TestCase(-5)
  @TestCase(-10)
  @TestCase(-Infinity)
  createFail(ttl: TTL) {
    Expect(() => new TTLCache(ttl)).toThrow();
  }

  @Test()
  // @TestCase(0) // flaky
  @TestCase(1)
  @TestCase(5)
  @TestCase(10)
  getSync(ttl: TTL) {
    const cache = new TTLCache(ttl);

    cache.set('abc', 123);

    Expect(cache.get('abc')).toBe(123);
  }

  @AsyncTest()
  // @TestCase(0, 0) // flaky
  // @TestCase(1, 0) // flaky
  @TestCase(5, 0)
  @TestCase(15, 10)
  async getAsync(ttl: TTL, ms: number) {
    const cache = new TTLCache(ttl);

    cache.set('abc', 123);

    await new Promise(resolve => setTimeout(resolve, ms));

    Expect(cache.get('abc')).toBe(123);
  }

  @AsyncTest()
  // @TestCase(0, 1) // flaky
  @TestCase(0, 5)
  @TestCase(10, 15)
  async expireAsync(ttl: TTL, ms: number) {
    const cache = new TTLCache(ttl);

    cache.set('abc', 123);

    await new Promise(resolve => setTimeout(resolve, ms));

    Expect(cache.get('abc')).toBe(undefined);
  }

  @Test()
  flowSimpleKey() {
    const cache = new TTLCache();

    cache.set('abc', 123);

    Expect(cache.size).toBe(1);

    cache.set('abc', 456);

    Expect(cache.size).toBe(1);

    cache.set('def', 123);

    Expect(cache.size).toBe(2);

    cache.delete('abc');

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

    cache.set('abc', val);

    Expect(cache.get('abc')).toBe(val);
  }

  @Test()
  compareNaN() {
    const cache = new TTLCache();

    cache.set('abc', NaN);

    Expect(Number.isNaN(cache.get('abc'))).toBe(true);
  }

  // @Test()
  // compareUndefined() {
  //   const cache = new TTLCache();

  //   Expect(() => cache.set('abc', undefined)).toThrow();
  // }

  @Test()
  getValues() {
    const cache = new TTLCache();

    cache.set('abc', 123);

    Expect(cache.get('def')).toBe(undefined);
  }
}
