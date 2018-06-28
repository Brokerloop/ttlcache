
export type Key = string|object;

interface Entry<T> {
  readonly key: Key;   // handle to own key
  val:  T;             // user-supplied cached value
  exp:  number;        // timestamp at which entry expires, in ms
  prev: Entry<T>|null;
  next: Entry<T>|null;
}

const def = {
  ttl: 1000,    // entry TTL in ms
  max: Infinity // max number of entries in cache
};

export type Opts = typeof def;

const makeOpt = <T>(defs: T, opts = {}): T => {
  const merged = { ...defs as any };

  for (const key in opts) {
    const val = (opts as any)[key];

    if (val !== undefined) {
      merged[key] = val;
    }
  }

  return merged;
};

export class TTLCache<T = any> {
  private oldest: Entry<T>|null = null;
  private youngest: Entry<T>|null = null;
  private readonly cache = new Map<Key, Entry<T>>();
  private readonly ttl: number;
  private readonly max: number;

  constructor(opt?: Partial<Opts>) {
    const { ttl, max } = makeOpt(def, opt);

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
    return this.cache.size;
  }

  has(key: Key) {
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

      return entry.val;
    }

    return null;
  }

  clear() {
    this.cache.clear();

    this.oldest = null;
    this.youngest = null;
  }

  get keys() {
    // cache Map preserves order
    return Array.from(this.cache.keys());
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
        if (entry === this.youngest) {
          entry.prev.next = null;
          this.youngest = entry.prev;
        }
        else {
          entry.prev.next = entry.next;
        }
      }

      if (entry.next) {
        if (entry === this.oldest) {
          entry.next.prev = null;
          this.oldest = entry.next;
        }
        else {
          entry.next.prev = entry.prev;
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

  debug() {
    const entries: string[] = [];

    this.cache.forEach(e => entries.push(`[${e.key}:${e.val}]`));

    return entries.join(' -> ');
  }
}
