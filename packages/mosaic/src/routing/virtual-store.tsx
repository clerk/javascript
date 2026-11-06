'use client';

import type { ReactNode } from 'react';
import { createContext, useContext, useEffect, useRef, useState } from 'react';

import { normalizeBase } from './base-path';
import type { SegmentParts } from './location';

/*
  The page's virtual location

  We keep this in a centralized place instead of in each component so that it behaves the same as a
  url in the other modes: it outlives the component, and it can be written to from the outside, by a
  modal that opens a surface at a page or by a return after a redirect.

  For example, in hash mode a modal would have to remove itself from the hash on close. We want that
  same behavior in virtual mode so each mode behaves identically and the components don't have to
  reason about the differences.

  We only need the external behavior to match the other modes however, so internally we keep state
  in a map instead of trying to cram it into a single "url"-like string. Nothing is encoded since it
  never goes into a real url.

  An entry lives for as long as its base has an owner, the way a URL segment lives for as long as
  the host is on that route. A mounted router scope counts itself in with `own`; when the last
  owner of a base leaves, the sweep below drops the entry. Only a base that has had an owner is
  swept, so an entry written ahead of a later mount survives until that owner has come and gone.
  Counting in store state, and sweeping after the commit, is what makes an owner replaced in the
  same commit (a modal reopened mid-exit, StrictMode's doubled effects) keep its entry: the count
  never reaches zero in a committed state.
*/

export type VirtualEntries = ReadonlyMap<string, SegmentParts>;

export type VirtualWrite = (base: string, parts: SegmentParts | undefined) => void;

export interface VirtualActions {
  write: VirtualWrite;
  own: (base: string) => () => void;
}

const VirtualEntriesContext = createContext<VirtualEntries | undefined>(undefined);
const VirtualActionsContext = createContext<VirtualActions | undefined>(undefined);

export interface VirtualStoreProviderProps {
  initial?: Record<string, SegmentParts>;
  children: ReactNode;
}

export function VirtualStoreProvider({ initial, children }: VirtualStoreProviderProps) {
  const [entries, setEntries] = useState<VirtualEntries>(
    () => new Map(Object.entries(initial ?? {}).map(([base, parts]) => [normalizeBase(base), parts])),
  );
  const [owners, setOwners] = useState<ReadonlyMap<string, number>>(() => new Map());
  const [actions] = useState<VirtualActions>(() => {
    const write: VirtualWrite = (base, parts) => {
      setEntries(previous => {
        if (parts === undefined && !previous.has(base)) {
          return previous;
        }
        const next = new Map(previous);
        if (parts === undefined) {
          next.delete(base);
        } else {
          next.set(base, parts);
        }
        return next;
      });
    };
    const count = (base: string, delta: number) => {
      setOwners(previous => new Map(previous).set(base, (previous.get(base) ?? 0) + delta));
    };
    return {
      write,
      own: base => {
        const key = normalizeBase(base);
        count(key, 1);
        return () => count(key, -1);
      },
    };
  });

  const previousOwners = useRef(owners);
  useEffect(() => {
    const previous = previousOwners.current;
    previousOwners.current = owners;
    for (const [base, had] of previous) {
      if (had > 0 && (owners.get(base) ?? 0) === 0) {
        actions.write(base, undefined);
      }
    }
  }, [owners, actions]);

  return (
    <VirtualActionsContext.Provider value={actions}>
      <VirtualEntriesContext.Provider value={entries}>{children}</VirtualEntriesContext.Provider>
    </VirtualActionsContext.Provider>
  );
}

function missingProvider(): never {
  throw new Error('[clerk] Virtual routing must be used within a <MosaicProvider>.');
}

export function useVirtualEntries(): VirtualEntries {
  return useContext(VirtualEntriesContext) ?? missingProvider();
}

export function useVirtualActions(): VirtualActions {
  return useContext(VirtualActionsContext) ?? missingProvider();
}

export function useVirtualWrite(): VirtualWrite {
  return useVirtualActions().write;
}

// The entry for a base, or undefined when the base has none. The array comes straight from the map,
// so it keeps its identity until that entry is written again.
export function useVirtualSegment(base: string): SegmentParts | undefined {
  return useVirtualEntries().get(normalizeBase(base));
}
