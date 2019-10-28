import { TestFixture, Test, SpyOn, Any, Expect } from 'alsatian';
import { TTLCache } from '../src';

@TestFixture()
export class SignalTests {
  @Test()
  empty() {
    const cache = new TTLCache();

    const spy = { onEvent() { /**/ } };
    SpyOn(spy, 'onEvent');

    cache.empty.on(spy.onEvent);

    cache.set('a', 123);
    cache.set('b', 123);

    cache.delete('a');
    cache.delete('b');

    Expect(spy.onEvent).toHaveBeenCalled().exactly(1);

    cache.set('a', 123);
    cache.delete('a');

    Expect(spy.onEvent).toHaveBeenCalled().exactly(2);
  }

  @Test()
  full() {
    const cache = new TTLCache({ max: 2 });

    const spy = { onEvent() { /**/ } };
    SpyOn(spy, 'onEvent');

    cache.full.on(spy.onEvent);

    cache.set('a', 123);
    cache.set('b', 123);

    Expect(spy.onEvent).toHaveBeenCalled().exactly(1);

    cache.delete('b');
    cache.set('b', 123);

    Expect(spy.onEvent).toHaveBeenCalled().exactly(2);
  }

  @Test()
  evict() {
    const cache = new TTLCache({ max: 2 });

    const spy = { onEvent(_: object) { /**/ } };
    SpyOn(spy, 'onEvent');

    cache.evict.on(spy.onEvent);

    cache.set('a', 123);
    cache.set('b', 123);
    cache.set('c', 123);

    Expect(spy.onEvent).toHaveBeenCalled().exactly(1);
    Expect(spy.onEvent).toHaveBeenCalledWith(
      Any<object>(Object).thatMatches({ key: 'a', val: 123 })
    );
  }
}
