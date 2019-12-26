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

    Expect([...cache.keys()]).toEqual(['c', 'b', 'a']);

    cache.get('a'); // bump

    Expect([...cache.keys()]).toEqual(['a', 'c', 'b']);
  }

  @Test()
  getNewest() {
    const cache = new TTLCache();

    cache.set('a', 123);
    cache.set('b', 123);
    cache.set('c', 123);

    Expect([...cache.keys()]).toEqual(['c', 'b', 'a']);

    cache.get('c'); // bump

    Expect([...cache.keys()]).toEqual(['c', 'b', 'a']);
  }

  @Test()
  getMiddle() {
    const cache = new TTLCache();

    cache.set('a', 123);
    cache.set('b', 123);
    cache.set('c', 123);

    Expect([...cache.keys()]).toEqual(['c', 'b', 'a']);

    cache.get('b'); // bump

    Expect([...cache.keys()]).toEqual(['b', 'c', 'a']);
  }

  @Test()
  setOldest() {
    const cache = new TTLCache();

    cache.set('a', 123);
    cache.set('b', 123);
    cache.set('c', 123);

    Expect([...cache.keys()]).toEqual(['c', 'b', 'a']);

    cache.set('a', 234); // bump

    Expect([...cache.keys()]).toEqual(['a', 'c', 'b']);
  }

  @Test()
  setNewest() {
    const cache = new TTLCache();

    cache.set('a', 123);
    cache.set('b', 123);
    cache.set('c', 123);

    Expect([...cache.keys()]).toEqual(['c', 'b', 'a']);

    cache.set('c', 234); // bump

    Expect([...cache.keys()]).toEqual(['c', 'b', 'a']);
  }

  @Test()
  setMiddle() {
    const cache = new TTLCache();

    cache.set('a', 123);
    cache.set('b', 123);
    cache.set('c', 123);

    Expect([...cache.keys()]).toEqual(['c', 'b', 'a']);

    cache.set('b', 234); // bump

    Expect([...cache.keys()]).toEqual(['b', 'c', 'a']);
  }
}
