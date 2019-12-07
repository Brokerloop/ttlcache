import { TestFixture, Test, Expect } from 'alsatian';
import { MockClock } from './config';
import { TTLCache } from '../src';

@TestFixture()
export class UtilTests {
  @Test()
  iterateValidEntries() {
    const clock = new MockClock();

    const cache = new TTLCache({ ttl: 50, clock });

    cache.set('a', 123);

    clock.pass(100);

    cache.set('b', 123);
    cache.set('c', 123);

    const keys: string[] = [];

    for (const { key } of cache.entries()) {
      keys.push(key);
    }

    Expect(keys).toEqual(['c', 'b']);
  }

  @Test()
  iterateValidKeys() {
    const clock = new MockClock();

    const cache = new TTLCache({ ttl: 50, clock });

    cache.set('a', 123);

    clock.pass(100);

    cache.set('b', 123);
    cache.set('c', 123);

    const keys: string[] = [];

    for (const key of cache.keys()) {
      keys.push(key);
    }

    Expect(keys).toEqual(['c', 'b']);
  }

  @Test()
  iterateValidValues() {
    const clock = new MockClock();

    const cache = new TTLCache({ ttl: 50, clock });

    cache.set('a', 1);

    clock.pass(100);

    cache.set('b', 2);
    cache.set('c', 3);

    const vals: number[] = [];

    for (const val of cache.values()) {
      vals.push(val);
    }

    Expect(vals).toEqual([3, 2]);
  }
}
