import { TestFixture, Test, Expect } from 'alsatian';
import { MockClock } from './config';
import { TTLCache } from '../src';

@TestFixture()
export class EvictTests {
  @Test()
  evictLRUEntry() {
    const cache = new TTLCache({ max: 2 });

    cache.set('a', 123);
    cache.set('b', 123);

    Expect(Array.from(cache.keys())).toEqual(['b', 'a']);

    cache.set('c', 123); // evict

    Expect(Array.from(cache.keys())).toEqual(['c', 'b']);
  }

  @Test()
  evictNewestEntry() {
    const cache = new TTLCache({ max: 3 });

    cache.set('a', 123);
    cache.set('b', 123);
    cache.set('c', 123);

    Expect(Array.from(cache.keys())).toEqual(['c', 'b', 'a']);

    cache.delete('c'); // evict

    Expect(Array.from(cache.keys())).toEqual(['b', 'a']);
  }

  @Test()
  evictMiddleEntry() {
    const cache = new TTLCache({ max: 3 });

    cache.set('a', 123);
    cache.set('b', 123);
    cache.set('c', 123);

    Expect(Array.from(cache.keys())).toEqual(['c', 'b', 'a']);

    cache.delete('b'); // evict

    Expect(Array.from(cache.keys())).toEqual(['c', 'a']);
  }

  @Test()
  cleanupExpiredKeys() {
    const clock = new MockClock();

    const cache = new TTLCache({ ttl: 100, clock });

    // set first key
    cache.set('a', 123);

    clock.pass(50);

    // set second key
    cache.set('b', 123);

    cache.cleanup();

    Expect(cache.size).toEqual(2);
    Expect(Array.from(cache.keys())).toEqual(['b', 'a']);

    // expire first key
    clock.pass(75);

    Expect(cache.size).toEqual(2);

    cache.cleanup();

    Expect(cache.size).toEqual(1);
    Expect(Array.from(cache.keys())).toEqual(['b']);

    // expire second key
    clock.pass(50);

    Expect(cache.size).toEqual(1);
    Expect(Array.from(cache.keys())).toEqual([]);
  }

  @Test()
  evictResize() {
    const cache = new TTLCache({ max: 4 });

    cache.set('a', 123);
    cache.set('b', 123);
    cache.set('c', 123);
    cache.set('d', 123);

    Expect(Array.from(cache.keys())).toEqual(['d', 'c', 'b', 'a']);

    Expect(() => cache.resize(0)).toThrow();

    cache.resize(5); // grow

    Expect(Array.from(cache.keys())).toEqual(['d', 'c', 'b', 'a']);

    cache.resize(3); // shrink by 2, drop 1

    Expect(Array.from(cache.keys())).toEqual(['d', 'c', 'b']);

    cache.resize(2); // shrink by 1, drop 1

    Expect(Array.from(cache.keys())).toEqual(['d', 'c']);

    cache.resize(5); // grow

    Expect(Array.from(cache.keys())).toEqual(['d', 'c']);
  }

  @Test()
  evictKeyRepeatedly() {
    const cache = new TTLCache({ max: 10 });

    cache.set('a', 1);
    cache.set('b', 2);
    cache.set('c', 3);
    cache.set('d', 4);

    Expect(Array.from(cache.keys())).toEqual(['d', 'c', 'b', 'a']);

    cache.set('a', 1);

    Expect(Array.from(cache.keys())).toEqual(['a', 'd', 'c', 'b']);

    cache.set('e', 5);
    cache.set('f', 6);
    cache.set('g', 7);
    cache.set('h', 8);

    Expect(Array.from(cache.keys())).toEqual(['h', 'g', 'f', 'e', 'a', 'd', 'c', 'b']);

    cache.set('a', 1);

    Expect(Array.from(cache.keys())).toEqual(['a', 'h', 'g', 'f', 'e', 'd', 'c', 'b']);

    cache.set('i', 9);
    cache.set('j', 10);
    cache.set('k', 11);

    Expect(Array.from(cache.keys())).toEqual(['k', 'j', 'i', 'a', 'h', 'g', 'f', 'e', 'd', 'c']);

    cache.set('a', 1);

    Expect(Array.from(cache.keys())).toEqual(['a', 'k', 'j', 'i', 'h', 'g', 'f', 'e', 'd', 'c']);

    cache.set('l', 12);

    Expect(Array.from(cache.keys())).toEqual(['l', 'a', 'k', 'j', 'i', 'h', 'g', 'f', 'e', 'd']);

    cache.set('m', 13);

    Expect(Array.from(cache.keys())).toEqual(['m', 'l', 'a', 'k', 'j', 'i', 'h', 'g', 'f', 'e']);

    cache.set('n', 14);

    Expect(Array.from(cache.keys())).toEqual(['n', 'm', 'l', 'a', 'k', 'j', 'i', 'h', 'g', 'f']);

    cache.set('o', 15);
    cache.set('p', 16);
    cache.set('q', 17);

    Expect(Array.from(cache.keys())).toEqual(['q', 'p', 'o', 'n', 'm', 'l', 'a', 'k', 'j', 'i']);
  }
}
