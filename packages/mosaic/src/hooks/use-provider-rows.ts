import { useRef } from 'react';

import { useStableOrder } from '../primitives/hooks';

export interface ProviderRow<Connected, Provider> {
  key: string;
  connected?: Connected;
  provider?: Provider;
}

const byKey = (row: { key: string }) => row.key;

/**
 * One row per provider across its connected and offered states. A connected item takes its
 * provider's id as its key when that provider is no longer offered, so the row that offered
 * "Connect" is the row that shows the connection, and a removed connection becomes the offer
 * again in place. Further items of the same provider, and items whose provider is still offered,
 * keep their own id. A key is kept for as long as its item is present, and rows keep the order
 * they were first shown in.
 */
export function useProviderRows<Connected extends { id: string }, Provider extends { id: string }>(
  connected: Connected[],
  providers: Provider[],
  providerOf: (item: Connected) => string | undefined,
): Array<ProviderRow<Connected, Provider>> {
  const claims = useRef(new Map<string, string>());
  const taken = new Set(providers.map(provider => provider.id));
  const present = new Set<string>();
  const rows: Array<ProviderRow<Connected, Provider>> = [];

  for (const item of connected) {
    const wanted = claims.current.get(item.id) ?? providerOf(item) ?? item.id;
    const key = taken.has(wanted) ? item.id : wanted;
    taken.add(key);
    claims.current.set(item.id, key);
    present.add(item.id);
    rows.push({ key, connected: item });
  }
  for (const id of claims.current.keys()) {
    if (!present.has(id)) {
      claims.current.delete(id);
    }
  }
  for (const provider of providers) {
    rows.push({ key: provider.id, provider });
  }

  return useStableOrder(rows, byKey);
}
