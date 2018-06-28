import { TestFixture, Test, Expect } from 'alsatian';
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
  evictYoungestEntry() {
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
}
