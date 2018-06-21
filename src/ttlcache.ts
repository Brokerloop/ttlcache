
export type Key = string|object;

export interface Entry<T> {
  val: T;
  exp: number; // ts at which entry expires
}

export class TTLCache<T = any> {
  private readonly cache = new Map<Key, Entry<T>>();
  private readonly timers = new Map<Key, number>();
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
    return !!this.cache.get(key);
  }

  get(key: Key) {
    const item = this.cache.get(key);

    return item && item.val;
  }

  set(key: Key, val: T) {
    this.clearTimer(key);

    this.cache.set(key, { val, exp: Date.now() + this.ttl });

    this.setTimer(key);
  }

  delete(key: Key) {
    this.clearTimer(key);

    this.cache.delete(key);
  }

  clear() {
    this.cache.forEach(k => this.clearTimer(k));

    this.cache.clear();
  }

  private setTimer(key: Key) {
    const newTimer = setTimeout(() => this.delete(key), this.ttl);

    this.timers.set(key, newTimer as any);
  }

  private clearTimer(key: Key) {
    const timer = this.timers.get(key);

    if (timer) {
      clearTimeout(timer as any);
    }
  }
}
