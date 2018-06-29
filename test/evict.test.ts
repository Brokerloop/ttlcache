import { TestFixture, Test, AsyncTest, Expect } from 'alsatian';
import { TTLCache } from '../src';

@TestFixture()
export class EvictTests {
  @Test()
  evictLRUEntry() {
    const cache = new TTLCache({ max: 2 });

    cache.set('a', 123);
    cache.set('b', 123);

    Expect(cache.keys).toEqual(['a', 'b']);

    cache.set('c', 123); // evict

    Expect(cache.keys).toEqual(['b', 'c']);
  }

  @Test()
  evictNewestEntry() {
    const cache = new TTLCache({ max: 3 });

    cache.set('a', 123);
    cache.set('b', 123);
    cache.set('c', 123);

    Expect(cache.keys).toEqual(['a', 'b', 'c']);

    cache.delete('c'); // evict

    Expect(cache.keys).toEqual(['a', 'b']);
  }

  @Test()
  evictMiddleEntry() {
    const cache = new TTLCache({ max: 3 });

    cache.set('a', 123);
    cache.set('b', 123);
    cache.set('c', 123);

    Expect(cache.keys).toEqual(['a', 'b', 'c']);

    cache.delete('b'); // evict

    Expect(cache.keys).toEqual(['a', 'c']);
  }

  @AsyncTest()
  async cleanupExpiredKeys() {
    const cache = new TTLCache({ ttl: 100 });

    // set first key
    cache.set('a', 123);

    await new Promise(resolve => setTimeout(resolve, 50));

    // set second key
    cache.set('b', 123);

    cache.cleanup();

    Expect(cache.size).toEqual(2);
    Expect(cache.keys).toEqual(['a', 'b']);

    // expire first key
    await new Promise(resolve => setTimeout(resolve, 75));

    Expect(cache.size).toEqual(2);
    Expect(cache.keys).toEqual(['a', 'b']);

    cache.cleanup();

    Expect(cache.size).toEqual(1);
    Expect(cache.keys).toEqual(['b']);

    // expire second key
    await new Promise(resolve => setTimeout(resolve, 50));

    Expect(cache.size).toEqual(1);
    Expect(cache.keys).toEqual(['b']);

    cache.cleanup();

    Expect(cache.size).toEqual(0);
    Expect(cache.keys).toEqual([]);
  }

  @Test()
  evictResize() {
    const cache = new TTLCache({ max: 4 });

    cache.set('a', 123);
    cache.set('b', 123);
    cache.set('c', 123);
    cache.set('d', 123);

    Expect(cache.keys).toEqual(['a', 'b', 'c', 'd']);

    Expect(() => cache.resize(0)).toThrow();

    cache.resize(5); // grow

    Expect(cache.keys).toEqual(['a', 'b', 'c', 'd']);

    cache.resize(3); // shrink by 2, drop 1

    Expect(cache.keys).toEqual(['b', 'c', 'd']);

    cache.resize(2); // shrink by 1, drop 1

    Expect(cache.keys).toEqual(['c', 'd']);

    cache.resize(5); // grow

    Expect(cache.keys).toEqual(['c', 'd']);
  }
}
