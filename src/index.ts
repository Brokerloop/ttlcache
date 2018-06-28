
export type Key = string|object;

interface Entry<T> {
  readonly key: Key;   // handle to entry's own key
  val:  T;             // user-supplied cached value
  exp:  number;        // timestamp at which entry expires, in ms
  prev: Entry<T>|null;
  next: Entry<T>|null;
}

const def = {
  ttl: 1000,    // default entry TTL in ms
  max: Infinity // max number of entries in cache
};

export type Opts = typeof def;

export class TTLCache<T = any> {
  private oldest: Entry<T>|null = null;
  private youngest: Entry<T>|null = null;
  private max: number;
  private readonly cache = new Map<Key, Entry<T>>(); // preserves insert order
  private readonly ttl: number;

  constructor(opt?: Partial<Opts>) {
    const { ttl, max } = TTLCache.makeOpt(def, opt);

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

  get keys() {
    // includes expired
    return Array.from(this.cache.keys());
  }

  has(key: Key) {
    // includes expired
    return this.cache.has(key);
  }

  get(key: Key) {
    const entry = this.cache.get(key);

    if (entry) {
      if (TTLCache.isExpired(entry)) {
        this.evict(entry);

        return undefined;
      }
      else {
        return entry.val;
      }
    }
    else {
      return undefined;
    }
  }

  set(key: Key, val: T) {
    const prev = this.cache.get(key);

    if (prev) {
      prev.val = val;
      prev.exp = Date.now() + this.ttl; // refresh

      // reset insertion order
      this.cache.delete(key);
      this.cache.set(key, prev);

      this.bumpAge(prev);
    }
    else {
      if (this.cache.size === this.max) {
        this.evict(this.oldest!);
      }

      const entry: Entry<T> = {
        key,
        val,
        exp:  Date.now() + this.ttl,
        prev: null,
        next: null
      };

      this.cache.set(key, entry);

      this.bumpAge(entry);
    }
  }

  delete(key: Key) {
    const entry = this.cache.get(key);

    if (entry) {
      this.evict(entry);

      return true;
    }

    return false;
  }

  cleanup() {
    while (this.oldest) {
      if (TTLCache.isExpired(this.oldest)) {
        this.evict(this.oldest);
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
        this.evict(this.oldest!);

        drop--;
      }
    }

    this.max = max;
  }

  clear() {
    this.cache.clear();

    this.oldest = null;
    this.youngest = null;
  }

  debug() {
    const entries: string[] = [];

    this.cache.forEach(e => entries.push(`[${e.key}:${e.val}]`));

    return entries.join(' -> ');
  }

  private bumpAge(entry: Entry<T>) {
    if (entry === this.youngest) {
      // already youngest or only entry
      return;
    }
    else if (!this.oldest || !this.youngest) {
      // set only entry
      this.oldest = entry;
      this.youngest = entry;
    }
    else {
      if (entry === this.oldest) {
        entry.next!.prev = null;

        this.oldest = entry.next;
      }

      entry.prev = this.youngest;
      entry.next = null;

      this.youngest.next = entry;
      this.youngest = entry;
    }
  }

  private evict(entry: Entry<T>) {
    if (!entry.prev && !entry.next) {
      // only entry
      this.oldest = null;
      this.youngest = null;
    }
    else {
      if (entry.prev) {
        entry.prev.next = entry.next; // maybe null

        if (entry === this.youngest) {
          this.youngest = entry.prev;
        }
      }

      if (entry.next) {
        entry.next.prev = entry.prev; // maybe null

        if (entry === this.oldest) {
          this.oldest = entry.next;
        }
      }
    }

    this.cache.delete(entry.key);
  }

  private static isExpired<T>(entry: Entry<T>) {
    // entry is valid during same ms
    // NOTE: flaky async results with very small TTL
    return entry.exp < Date.now();
  }

  private static makeOpt<T>(defs: T, opts = {}): T {
    const merged = { ...defs as any };

    for (const key in opts) {
      const val = (opts as any)[key];

      if (val !== undefined) {
        merged[key] = val;
      }
    }

    return merged;
  }
}
