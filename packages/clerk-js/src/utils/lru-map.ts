/**
 * A simple Map with LRU (Least Recently Used) eviction.
 * When the map exceeds maxSize, the oldest entries are removed.
 */
export class LruMap<K, V> extends Map<K, V> {
  constructor(private maxSize: number) {
    super();
  }

  override get(key: K): V | undefined {
    const value = super.get(key);
    if (value !== undefined) {
      super.delete(key);
      super.set(key, value);
    }
    return value;
  }

  override set(key: K, value: V): this {
    if (super.has(key)) {
      super.delete(key);
    } else {
      while (this.size >= this.maxSize) {
        const oldest = super.keys().next().value;
        if (oldest !== undefined) {
          super.delete(oldest);
        } else {
          break;
        }
      }
    }
    return super.set(key, value);
  }
}
