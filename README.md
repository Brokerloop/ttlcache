# @brokerloop/ttlcache

[![Build Status](https://travis-ci.org/Brokerloop/ttlcache.svg?branch=master)](https://travis-ci.org/Brokerloop/ttlcache)
[![Coverage Status](https://coveralls.io/repos/github/Brokerloop/ttlcache/badge.svg?branch=coverage)](https://coveralls.io/github/Brokerloop/ttlcache?branch=coverage)
[![Dependency Status](https://david-dm.org/Brokerloop/ttlcache/status.svg)](https://david-dm.org/Brokerloop/ttlcache)
[![npm version](https://badge.fury.io/js/%40brokerloop%2Fttlcache.svg)](https://badge.fury.io/js/%40brokerloop%2Fttlcache)

**Evented LRU TTL cache for Node.js and browsers**

- A cache with a configurable number of expiring entries.
- Reading an expired entry removes it from the cache.
- When the cache is full, [Least-Recently-Used](https://en.wikipedia.org/wiki/Cache_replacement_policies#LRU) entries are evicted first.

### Installation

```sh
npm install @brokerloop/ttlcache --save
```

### Usage (TypeScript)

```ts
import { TTLCache } from '@brokerloop/ttlcache';

const cache = new TTLCache<string, number>({
  ttl:   5000,
  max:   10,
  clock: Date
});

cache.set('a', 123);
cache.has('a');      // true
cache.get('a');      // 123
cache.get('b');      // undefined
cache.delete('a');   // 123

cache.empty.on(() => {
  // cache is empty
});

cache.full.on(() => {
  // cache is full
});

cache.evict.on(({ key, val }) => {
  // entry evicted
});
```

### Options

```js
{
  ttl:   1000,         // default entry TTL in ms
  max:   Infinity,     // max number of entries in cache
  clock: Date as Clock // cache-relative clock
}
```

#### `clock`
By default, the cache uses `Date.now()` to expire entries. This works while the system date/time do not change. You can provide your own implementation of the `Clock` interface:
```ts
interface Clock {
  now:         () => number; // must be monotonically increasing
  [_: string]: any;
}
```
```ts
const clock = (() => {
  let time = 0;

  const clock: Clock = {
    now:  () => time,
    pass: (ms: number) => time += ms
  };

  return clock;
})();
```

### Properties

#### `size`
Returns the size of the cache, including expired entries. Run `cleanup()` first to obtain valid cache size.

### Methods

#### `keys(): Iterator<K>`
Returns an iterator over valid cache entry keys, from newest to oldest. Expired entries are not evicted.

#### `values(): Iterator<V>`
Returns an iterator over valid cache entry values, from newest to oldest. Expired entries are not evicted.

#### `entries(): Iterator<{ key: K, val: V }>`
Returns an iterator over valid cache entries, from newest to oldest. Expired entries are not evicted.

#### `has(key: K): boolean`
Checks if `key` exists in the cache. Does not evict the entry if expired.

#### `get(key: K): V|undefined`
Finds an entry by the given `key`. Returns `undefined` if not found or if the entry is expired, also evicting it.

#### `set(key: K, val: V): void`
Creates an entry at `key`, evicting the cache's LRU entry if the cache is full. If an expired entry already exists at `key`, its LRU-age is refreshed but it is not evicted.

#### `delete(key: K): V|undefined`
Finds and removes an entry at `key`. Returns the entry value if it was removed, or `undefined` otherwise.

#### `cleanup(opts = { emit: true }): void`
Evicts all expired entries from the cache. Pass `emit: false` to not emit `evict` events.

#### `resize(max: number, opts = { emit: true }): void`
Resizes the cache to the given `max` size. When growing, no entries are evicted. When shrinking, entries are evicted as needed, by oldest LRU-age, until the new `max` is reached. Pass `emit: false` to not emit `evict` events.

#### `clear(): void`
Empties the cache, removing all entries, without firing signals.

### Events (via [Signal](https://github.com/soncodi/signal))

#### `empty`
Signal fired after cache becomes empty. Does not fire on `clear()`.

#### `full`
Signal fired after cache becomes full.

#### `evict`
Signal fired after a cache entry is evicted. The evicted entry `{ key: K, val: V }` is passed as an argument. Does not fire on `delete()` and `clear()`.

### License

[LICENSE](./LICENSE)
