import { normalizeBase } from './base-path';
import type { MosaicLocation } from './location';
import { useVirtualSegment, type VirtualWrite } from './virtual-store';

// One entry of the page's virtual store, read and written as decoded parts. Nothing to encode:
// virtual state has no URL form until a carrier projects it.
export function createVirtualLocation(basePath: string, write: VirtualWrite): MosaicLocation {
  const base = normalizeBase(basePath);
  return {
    useSegmentParts: () => useVirtualSegment(base),
    write: parts => write(base, parts),
    clear: () => write(base, undefined),
  };
}
