import { TestFixture, AsyncTest, Expect } from 'alsatian';
import { TTLCache } from '../src';

@TestFixture()
export class BumpTests {
  @AsyncTest()
  async iterateValidEntries() {
    const cache = new TTLCache({ ttl: 50 });

    cache.set('a', 123);

    await new Promise(resolve => setTimeout(resolve, 100));

    cache.set('b', 123);
    cache.set('c', 123);

    const keys: string[] = [];

    for (const { key } of cache.entries()) {
      keys.push(key);
    }

    Expect(keys).toEqual(['b', 'c']);
  }

  @AsyncTest()
  async iterateValidKeys() {
    const cache = new TTLCache({ ttl: 50 });

    cache.set('a', 123);

    await new Promise(resolve => setTimeout(resolve, 100));

    cache.set('b', 123);
    cache.set('c', 123);

    const keys: string[] = [];

    for (const key of cache.keys()) {
      keys.push(key);
    }

    Expect(keys).toEqual(['b', 'c']);
  }

  @AsyncTest()
  async iterateValidValues() {
    const cache = new TTLCache({ ttl: 50 });

    cache.set('a', 1);

    await new Promise(resolve => setTimeout(resolve, 100));

    cache.set('b', 2);
    cache.set('c', 3);

    const vals: string[] = [];

    for (const val of cache.values()) {
      vals.push(val);
    }

    Expect(vals).toEqual([2, 3]);
  }
}
