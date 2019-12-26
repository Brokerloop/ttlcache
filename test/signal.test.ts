import { TestFixture, Test, Any, Expect } from 'alsatian';
import { MockClock, makeSpy } from './config';
import { TTLCache } from '../src';

@TestFixture()
export class SignalTests {
  @Test()
  empty() {
    const cache = new TTLCache();

    const spy = makeSpy();

    cache.empty.on(spy.on);

    cache.set('a', 123);
    cache.set('b', 123);

    cache.delete('a');
    cache.delete('b');

    Expect(spy.on).toHaveBeenCalled().exactly(1);

    cache.set('a', 123);
    cache.delete('a');

    Expect(spy.on).toHaveBeenCalled().exactly(2);
  }

  @Test()
  full() {
    const cache = new TTLCache({ max: 2 });

    const spy = makeSpy();

    cache.full.on(spy.on);

    cache.set('a', 123);
    cache.set('b', 123);

    Expect(spy.on).toHaveBeenCalled().exactly(1);

    cache.delete('b');
    cache.set('b', 123);

    Expect(spy.on).toHaveBeenCalled().exactly(2);

    cache.set('b', 123);

    Expect(spy.on).toHaveBeenCalled().exactly(2);
  }

  @Test()
  evictGetExpired() {
    const clock = new MockClock();

    const cache = new TTLCache({ ttl: 50, clock });

    const spy = makeSpy<object>();

    cache.evict.on(spy.on);

    cache.set('a', 123);

    clock.pass(100);

    cache.set('b', 123);

    cache.get('a'); // evict

    Expect(spy.on).toHaveBeenCalled().exactly(1);
    Expect(spy.on).toHaveBeenCalledWith(
      Any<object>(Object).thatMatches({ key: 'a', val: 123 })
    );
  }

  @Test()
  evictSetFull() {
    const cache = new TTLCache({ max: 2 });

    const spy = makeSpy();

    cache.evict.on(spy.on);

    const spy2 = makeSpy();

    cache.full.on(spy2.on);

    cache.set('a', 123);
    cache.set('b', 123); // full
    cache.set('c', 123); // evict, full

    Expect(spy.on).toHaveBeenCalled().exactly(1);
    Expect(spy.on).toHaveBeenCalledWith(
      Any<object>(Object).thatMatches({ key: 'a', val: 123 })
    );
    Expect(spy2.on).toHaveBeenCalled().exactly(2);
  }

  @Test()
  deleteNoEvict() {
    const cache = new TTLCache();

    const spy = makeSpy();

    cache.evict.on(spy.on);

    cache.set('a', 123);

    cache.delete('a');
    cache.delete('b');

    Expect(spy.on).not.toHaveBeenCalled();
  }

  @Test()
  cleanupEvict() {
    const clock = new MockClock();

    const cache = new TTLCache({ ttl: 50, clock });

    const spy = makeSpy();

    cache.evict.on(spy.on);

    cache.set('a', 123);
    cache.set('b', 123);

    clock.pass(100);

    cache.set('c', 123);

    Expect(spy.on).not.toHaveBeenCalled();

    cache.cleanup();

    Expect(spy.on).toHaveBeenCalled().exactly(2);
  }

  @Test()
  resizeEvict() {
    const cache = new TTLCache({ max: 5 });

    const spy = makeSpy();

    cache.evict.on(spy.on);

    cache.set('a', 123);
    cache.set('b', 123);
    cache.set('c', 123);
    cache.set('d', 123);
    cache.set('e', 123);

    Expect(spy.on).not.toHaveBeenCalled();

    cache.resize(3);

    Expect(spy.on).toHaveBeenCalled().exactly(2);

    cache.resize(10);

    Expect(spy.on).toHaveBeenCalled().exactly(2);

    cache.resize(2);

    Expect(spy.on).toHaveBeenCalled().exactly(3);
  }
}
