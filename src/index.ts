import { Signal } from '@soncodi/signal';

interface Entry<K, V> {
  readonly key: K;        // handle to entry's own key
  val:  V;                // user-supplied cached value
  exp:  number;           // timestamp at which entry expires, in ms
  prev: Entry<K, V>|null;
  next: Entry<K, V>|null;
}

export interface EntryView<K, V> {
  key: K;
  val: V;
}

export interface Clock {
  now:         () => number; // must be monotonically increasing
  [_: string]: any;
}

export const MIN_SIZE = 1;

const def = {
  ttl:   1000,         // default entry TTL in ms
  max:   Infinity,     // max number of entries in cache
  clock: Date as Clock // cache-relative clock
};

export type Opts = typeof def;

export class TTLCache<K = any, V = any> {
  readonly empty = new Signal();
  readonly full  = new Signal();
  readonly evict = new Signal<EntryView<K, V>>();

  private readonly cache = new Map<K, Entry<K, V>>();
  private oldest: Entry<K, V>|null = null;
  private newest: Entry<K, V>|null = null;

  private readonly ttl: number;
  private max: number;
  private readonly clock: Clock;

  constructor(opt?: Partial<Opts>) {
    const { ttl, max, clock } = { ...def, ...opt };

    if (ttl !== 0 && !(ttl > 0)) {
      throw new Error(`invalid TTL (${ttl})`);
    }
    else if (!(max >= MIN_SIZE)) {
      throw new Error(`invalid max (${max})`);
    }
    else if (!clock || typeof (clock.now as any) !== 'function') {
      throw new Error('invalid clock');
    }

    this.ttl   = ttl;
    this.max   = max;
    this.clock = clock;
  }

  get size() {
    // includes expired
    return this.cache.size;
  }

  *keys() {
    for (const entry of this.getIterator()) {
      yield entry.key;
    }
  }

  *values() {
    for (const entry of this.getIterator()) {
      yield entry.val;
    }
  }

  *entries() {
    for (const entry of this.getIterator()) {
      const view: EntryView<K, V> = {
        key: entry.key,
        val: entry.val
      };

      yield view;
    }
  }

  has(key: K) {
    return this.cache.has(key);
  }

  get(key: K) {
    const entry = this.cache.get(key);

    if (!entry) {
      return undefined;
    }
    else if (this.isExpired(entry)) {
      const unlinked = this.unlink(entry);

      this.evict.emit({
        key: unlinked.key,
        val: unlinked.val
      });

      if (this.cache.size === 0) {
        this.empty.emit();
      }

      return undefined;
    }
    else {
      this.bumpAge(entry);

      return entry.val;
    }
  }

  set(key: K, val: V) {
    const existing = this.cache.get(key);

    if (existing) {
      existing.val = val;

      this.bumpAge(existing);

      return;
    }

    const entry: Entry<K, V> = {
      key,
      val,
      exp:  this.clock.now() + this.ttl,
      prev: this.newest, // maybe null
      next: null
    };

    this.cache.set(entry.key, entry);

    if (this.newest) {
      this.newest.next = entry;
    }
    else {
      this.oldest = entry;
    }

    this.newest = entry;

    if (this.oldest && this.cache.size > this.max) {
      const unlinked = this.unlink(this.oldest);

      this.evict.emit({
        key: unlinked.key,
        val: unlinked.val
      });
    }

    if (this.cache.size === this.max) {
      this.full.emit();
    }
  }

  delete(key: K) {
    const entry = this.cache.get(key);

    if (!entry) {
      return undefined;
    }

    const unlinked = this.unlink(entry);

    if (this.cache.size === 0) {
      this.empty.emit();
    }

    return unlinked.val;
  }

  cleanup(opts = { emit: true }) {
    while (this.oldest && this.isExpired(this.oldest)) {
      const unlinked = this.unlink(this.oldest);

      if (opts.emit) {
        this.evict.emit({
          key: unlinked.key,
          val: unlinked.val
        });
      }
    }

    if (this.cache.size === 0) {
      this.empty.emit();
    }
  }

  resize(max: number, opts = { emit: true }) {
    if (!(max >= MIN_SIZE)) {
      throw new Error(`invalid max (${max})`);
    }
    else if (max === this.max) {
      return;
    }

    this.max = max;

    while (this.oldest && this.cache.size > this.max) {
      const unlinked = this.unlink(this.oldest);

      if (opts.emit) {
        this.evict.emit({
          key: unlinked.key,
          val: unlinked.val
        });
      }
    }
  }

  clear() {
    this.cache.clear();

    this.oldest = null;
    this.newest = null;
  }

  private bumpAge(entry: Entry<K, V>) {
    entry.exp = this.clock.now() + this.ttl;

    if (!entry.next) {
      // already newest
      return;
    }

    if (entry.prev) {
      entry.prev.next = entry.next;
    }
    else {
      this.oldest = entry.next;
    }

    entry.next.prev = entry.prev; // maybe null

    entry.prev = this.newest;
    entry.next = null;

    this.newest!.next = entry;
    this.newest = entry;
  }

  private unlink(entry: Entry<K, V>) {
    this.cache.delete(entry.key);

    if (entry.prev) {
      entry.prev.next = entry.next; // maybe null
    }
    else {
      this.oldest = entry.next;     // maybe null
    }

    if (entry.next) {
      entry.next.prev = entry.prev; // maybe null
    }
    else {
      this.newest = entry.prev;     // maybe null
    }

    return entry;
  }

  private *getIterator() {
    let current = this.newest;

    while (current && !this.isExpired(current)) {
      const entry = current;

      current = current.prev;

      yield entry;
    }
  }

  private isExpired<K, V>(entry: Entry<K, V>) {
    // entry is valid during same ms
    return entry.exp < this.clock.now();
  }
}
