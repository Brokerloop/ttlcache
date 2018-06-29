import { TestFixture, Test, Expect } from 'alsatian';
import { TTLCache } from '../src';

@TestFixture()
export class BumpTests {
  @Test()
  getOldest() {
    const cache = new TTLCache();

    cache.set('a', 123);
    cache.set('b', 123);
    cache.set('c', 123);

    Expect(Array.from(cache.keys())).toEqual(['a', 'b', 'c']);

    cache.get('a'); // bump

    Expect(Array.from(cache.keys())).toEqual(['b', 'c', 'a']);
  }

  @Test()
  getNewest() {
    const cache = new TTLCache();

    cache.set('a', 123);
    cache.set('b', 123);
    cache.set('c', 123);

    Expect(Array.from(cache.keys())).toEqual(['a', 'b', 'c']);

    cache.get('c'); // bump

    Expect(Array.from(cache.keys())).toEqual(['a', 'b', 'c']);
  }

  @Test()
  getMiddle() {
    const cache = new TTLCache();

    cache.set('a', 123);
    cache.set('b', 123);
    cache.set('c', 123);

    Expect(Array.from(cache.keys())).toEqual(['a', 'b', 'c']);

    cache.get('b'); // bump

    Expect(Array.from(cache.keys())).toEqual(['a', 'c', 'b']);
  }

  @Test()
  setOldest() {
    const cache = new TTLCache();

    cache.set('a', 123);
    cache.set('b', 123);
    cache.set('c', 123);

    Expect(Array.from(cache.keys())).toEqual(['a', 'b', 'c']);

    cache.set('a', 234); // bump

    Expect(Array.from(cache.keys())).toEqual(['b', 'c', 'a']);
  }

  @Test()
  setNewest() {
    const cache = new TTLCache();

    cache.set('a', 123);
    cache.set('b', 123);
    cache.set('c', 123);

    Expect(Array.from(cache.keys())).toEqual(['a', 'b', 'c']);

    cache.set('c', 234); // bump

    Expect(Array.from(cache.keys())).toEqual(['a', 'b', 'c']);
  }

  @Test()
  setMiddle() {
    const cache = new TTLCache();

    cache.set('a', 123);
    cache.set('b', 123);
    cache.set('c', 123);

    Expect(Array.from(cache.keys())).toEqual(['a', 'b', 'c']);

    cache.set('b', 234); // bump

    Expect(Array.from(cache.keys())).toEqual(['a', 'c', 'b']);
  }
}
