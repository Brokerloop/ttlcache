import { TestFixture, Test, Expect } from 'alsatian';
import { TTLCache } from '../src';

@TestFixture()
export class TypeTests {
  @Test()
  basicTypedCache() {
    const cache = new TTLCache<string, number>();

    cache.set('a', 123);
    cache.set('b', 456);

    const keys: string[] = [];
    const vals: number[] = [];

    for (const { key, val } of cache.entries()) {
      keys.push(key);
      vals.push(val);
    }

    Expect(keys).toEqual(['b', 'a']);
    Expect(vals).toEqual([456, 123]);
  }

  @Test()
  objectTypedCache() {
    interface A {
      a: string;
    }

    interface B {
      b: number;
    }

    const cache = new TTLCache<A, B>();

    cache.set({ a: 'a' }, { b: 123 });
    cache.set({ a: 'b' }, { b: 456 });

    const keys: A[] = [];
    const vals: B[] = [];

    for (const { key, val } of cache.entries()) {
      keys.push(key);
      vals.push(val);
    }

    Expect(keys).toEqual([{ a: 'b' }, { a: 'a' }]);
    Expect(vals).toEqual([{ b: 456 }, { b: 123 }]);
  }
}
