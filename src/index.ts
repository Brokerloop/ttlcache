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

const def = {
  ttl: 1000,    // default entry TTL in ms
  max: Infinity // max number of entries in cache
};

export type Opts = typeof def;

export class TTLCache<K = any, V = any> {
  readonly empty = new Signal();
  readonly full  = new Signal();
  readonly evict = new Signal<EntryView<K, V>>();

  private oldest: Entry<K, V>|null = null;
  private newest: Entry<K, V>|null = null;
  private max: number;
  private readonly cache = new Map<K, Entry<K, V>>();
  private readonly ttl: number;

  constructor(opt?: Partial<Opts>) {
    const { ttl, max } = { ...def, ...opt };

    if (ttl !== 0 && !(ttl > 0)) {
      throw new Error(`invalid TTL (${ttl})`);
    }
    else if (!(max > 1)) {
      throw new Error(`invalid max (${max})`);
    }

    this.ttl = ttl;
    this.max = max;
  }

  get size() {
    // includes expired
    return this.cache.size;
  }

  *keys() {
    for (const entry of this.getEvictingIterator()) {
      yield entry.key;
    }
  }

  *values() {
    for (const entry of this.getEvictingIterator()) {
      yield entry.val;
    }
  }

  *entries() {
    for (const entry of this.getEvictingIterator()) {
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
    else if (TTLCache.isExpired(entry)) {
      this.evictEntry(entry, true);

      return undefined;
    }
    else {
      this.bumpAge(entry);

      return entry.val;
    }
  }

  set(key: K, val: V) {
    const entry = this.cache.get(key);

    if (entry) {
      entry.val = val;

      this.bumpAge(entry);
    }
    else {
      if (this.cache.size === this.max) {
        this.evictEntry(this.oldest!, true);
      }

      this.insertNew({
        key,
        val,
        exp:  Date.now() + this.ttl,
        prev: null,
        next: null
      });

      if (this.cache.size === this.max) {
        this.full.emit();
      }
    }
  }

  delete(key: K) {
    const entry = this.cache.get(key);

    if (entry) {
      this.evictEntry(entry, false);

      const view: EntryView<K, V> = {
        key: entry.key,
        val: entry.val
      };

      return view;
    }

    return undefined;
  }

  cleanup() {
    while (this.oldest) {
      if (TTLCache.isExpired(this.oldest)) {
        this.evictEntry(this.oldest, true);
      }
      else {
        // remaining entries are newer
        break;
      }
    }
  }

  resize(max: number) {
    if (!(max > 1)) {
      throw new Error(`invalid max (${max})`);
    }

    const shrinkBy = this.max - max;

    if (shrinkBy > 0) {
      let drop = shrinkBy - (this.max - this.cache.size);

      while (drop > 0) {
        this.evictEntry(this.oldest!, true);

        drop--;
      }
    }

    this.max = max;
  }

  clear() {
    this.cache.clear();

    this.oldest = null;
    this.newest = null;
  }

  private insertNew(entry: Entry<K, V>) {
    this.cache.set(entry.key, entry);

    if (this.newest) {
      entry.prev = this.newest;

      this.newest.next = entry;
      this.newest = entry;
    }
    else {
      this.oldest = entry;
      this.newest = entry;
    }
  }

  private bumpAge(entry: Entry<K, V>) {
    entry.exp = Date.now() + this.ttl;

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

  private evictEntry(entry: Entry<K, V>, emit: boolean) {
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

    if (emit) {
      this.evict.emit({
        key: entry.key,
        val: entry.val
      });
    }

    if (this.cache.size === 0) {
      this.empty.emit();
    }
  }

  private *getEvictingIterator() {
    let entry = this.newest;

    while (entry) {
      if (TTLCache.isExpired(entry)) {
        this.evictEntry(entry, true);

        entry = entry.prev;

        continue;
      }

      yield entry;

      entry = entry.prev;
    }
  }

  private static isExpired<K, V>(entry: Entry<K, V>) {
    // entry is valid during same ms
    // NOTE: flaky async results with very small TTL
    return entry.exp < Date.now();
  }
}
