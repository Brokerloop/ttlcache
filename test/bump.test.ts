import { TestFixture, Test, Expect } from 'alsatian';
import { TTLCache } from '../src/ttlcache';

@TestFixture()
export class BumpTests {
  @Test()
  bumpOldest() {
    const cache = new TTLCache({ max: 3 });

    cache.set('a', 123);
    cache.set('b', 123);
    cache.set('c', 123);

    Expect(cache.keys).toEqual(['a', 'b', 'c']);

    cache.set('a', 234); // bump

    Expect(cache.keys).toEqual(['b', 'c', 'a']);
  }

  @Test()
  bumpYoungest() {
    const cache = new TTLCache({ max: 3 });

    cache.set('a', 123);
    cache.set('b', 123);
    cache.set('c', 123);

    Expect(cache.keys).toEqual(['a', 'b', 'c']);

    cache.set('c', 234); // bump

    Expect(cache.keys).toEqual(['a', 'b', 'c']);
  }

  @Test()
  bumpMiddle() {
    const cache = new TTLCache({ max: 3 });

    cache.set('a', 123);
    cache.set('b', 123);
    cache.set('c', 123);

    Expect(cache.keys).toEqual(['a', 'b', 'c']);

    cache.set('b', 234); // bump

    Expect(cache.keys).toEqual(['a', 'c', 'b']);
  }
}
