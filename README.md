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

`npm install @brokerloop/ttlcache --save`

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
cache.size;          // 1
cache.keys();        // ['b']
cache.clear();
```

### Options

```js
{
  ttl: 1000,    // default entry TTL in ms
  max: Infinity // max number of entries in cache
}
```

### License

[LICENSE](./LICENSE)
