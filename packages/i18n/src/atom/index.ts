import { atom as nanoAtom } from 'nanostores';

import type { WritableStore } from '../types';

// Stores are nanostores under the hood. The nanostores store contract
// (`.get` / `.set` / `.subscribe` / `.listen`) is exactly our `ReadableStore` /
// `WritableStore` shape, so no adapter layer is needed.

/** A writable store, equivalent to a nanostores `atom()`. */
export function atom<T>(initial: T): WritableStore<T> {
  return nanoAtom(initial) as WritableStore<T>;
}
