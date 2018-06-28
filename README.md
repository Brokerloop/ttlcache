# @brokerloop/ttlcache

[![Build Status](https://travis-ci.org/Brokerloop/ttlcache.svg?branch=master)](https://travis-ci.org/Brokerloop/ttlcache)
[![Coverage Status](https://coveralls.io/repos/github/Brokerloop/ttlcache/badge.svg?branch=coverage)](https://coveralls.io/github/Brokerloop/ttlcache?branch=coverage)
[![Dependency Status](https://david-dm.org/Brokerloop/ttlcache/status.svg)](https://david-dm.org/Brokerloop/ttlcache)
[![npm version](https://badge.fury.io/js/%40brokerloop%2Fttlcache.svg)](https://badge.fury.io/js/%40brokerloop%2Fttlcache)

**LRU TTL cache for Node.js and browsers**

- A cache with a configurable number of expiring entries.
- Reading an expired entry removes it from the cache.
- When the cache is full, [Least-Recently-Used](https://en.wikipedia.org/wiki/Cache_replacement_policies#LRU) entries are evicted first.

### Installation

```sh
npm install @brokerloop/ttlcache --save
```

### Usage

```js
import { TTLCache } from '@brokerloop/ttlcache';
// or
const { TTLCache } = require('@brokerloop/ttlcache');

const cache = new TTLCache({
  ttl: 5000,
  max: 10
});

cache.set('a', 123);
cache.set('b', 456);
cache.get('a');      // 123
cache.get('c');      // undefined
cache.delete('a');
```

### Default Options

```js
{
  ttl: 1000,    // default entry TTL in ms
  max: Infinity // max number of entries in cache
}
```

### Getters/Setters

#### `size`
Returns the size of the cache, including expired entries.

#### `keys`
Returns an array of cache keys, ordered by oldest first, including expired entries.

### Methods

#### `get(key: string|object): any`
Finds an entry by the given `key`. Returns `undefined` if not found or if the entry is expired. Expired entries are evicted from the cache.

#### `set(key: string|object, val: any): void`
Creates an entry at `key` with the given value, evicting the LRU entry if the cache is full. Refreshes the LRU-age of the inserted entry, even if one already exists at `key` and has expired.

#### `has(key: string|object): boolean`
Checks whether the cache contains an entry at the given `key`. Does not evict expired entries.

#### `delete(key: string|object): boolean`
Attempts to remove an entry at `key`. Returns `true` if an entry was found and removed.

#### `cleanup(): void`
Evicts all expired entries in the cache.

#### `clear(): void`
Clears the cache, removing all entries.

#### `debug(): string`
Creates a string representation e.g. `"[a:1] -> [b:2] -> [c:3]"` of the cache entries, for testing purposes.

### License

[LICENSE](./LICENSE)
