'use client';

import type { ReactNode } from 'react';
import { createContext, useCallback, useContext, useState } from 'react';

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
*/

export type VirtualEntries = ReadonlyMap<string, SegmentParts>;

export type VirtualWrite = (base: string, parts: SegmentParts | undefined) => void;

const EMPTY_PARTS: SegmentParts = Object.freeze([]);

const VirtualEntriesContext = createContext<VirtualEntries | undefined>(undefined);
const VirtualWriteContext = createContext<VirtualWrite | undefined>(undefined);

export interface VirtualStoreProviderProps {
  initial?: Record<string, SegmentParts>;
  children: ReactNode;
}

export function VirtualStoreProvider({ initial, children }: VirtualStoreProviderProps) {
  const [entries, setEntries] = useState<VirtualEntries>(
    () => new Map(Object.entries(initial ?? {}).map(([base, parts]) => [normalizeBase(base), parts])),
  );
  const write = useCallback<VirtualWrite>((base, parts) => {
    setEntries(previous => {
      const next = new Map(previous);
      if (parts === undefined) {
        next.delete(base);
      } else {
        next.set(base, parts);
      }
      return next;
    });
  }, []);

  return (
    <VirtualWriteContext.Provider value={write}>
      <VirtualEntriesContext.Provider value={entries}>{children}</VirtualEntriesContext.Provider>
    </VirtualWriteContext.Provider>
  );
}

function missingProvider(): never {
  throw new Error('[clerk] Virtual routing must be used within a <MosaicProvider>.');
}

export function useVirtualEntries(): VirtualEntries {
  return useContext(VirtualEntriesContext) ?? missingProvider();
}

export function useVirtualWrite(): VirtualWrite {
  return useContext(VirtualWriteContext) ?? missingProvider();
}

// The entry for a base, or no parts. The array comes straight from the map, so it keeps its
// identity until that entry is written again.
export function useVirtualSegment(base: string): SegmentParts {
  return useVirtualEntries().get(normalizeBase(base)) ?? EMPTY_PARTS;
}
