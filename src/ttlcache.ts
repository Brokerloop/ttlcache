
export type Key = string|object;

export interface Entry<T> {
  val: T;
  exp: number; // ts at which entry expires
}

export class TTLCache<T = any> {
  private readonly cache = new Map<Key, Entry<T>>();
  private readonly ttl: number = 0;

  constructor(ttl = 1000) {
    if (typeof ttl !== 'number' || !(ttl >= 0)) {
      throw new Error(`Invalid TTL (${ttl}).`);
    }

    this.ttl = +ttl;
  }

  get size() {
    return this.cache.size;
  }

  has(key: Key) {
    const item = this.cache.get(key);

    return !!item && !TTLCache.isExpired(item);
  }

  get(key: Key) {
    const item = this.cache.get(key);

    if (!item) {
      return undefined;
    }
    else if (TTLCache.isExpired(item)) {
      this.delete(key);

      return undefined;
    }
    else {
      return item.val;
    }
  }

  set(key: Key, val: T) {
    this.cache.set(key, { val, exp: Date.now() + this.ttl });
  }

  delete(key: Key) {
    this.cache.delete(key);
  }

  clear() {
    this.cache.clear();
  }

  private static isExpired<T>(item: Entry<T>) {
    // key is valid during same ms
    // NOTE: flaky async results with very small TTL
    return item.exp < Date.now();
  }
}
