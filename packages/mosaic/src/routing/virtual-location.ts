import { useMemo } from 'react';

import type { MosaicLocation, SegmentParts } from './location';
import { useVirtualUrl } from './virtual-url';

// The virtual URL is kept in its encoded form, like a real one, so all locations work the same

export function normalizeBase(base: string): string {
  const parts = base.split('/').filter(Boolean);
  return parts.length ? `/${parts.join('/')}` : '';
}

function rawPartsOf(url: string): string[] {
  return url.split('/').filter(Boolean);
}

export function rawSegmentPartsOf(url: string, base: string): string[] {
  const parts = rawPartsOf(url);
  const baseParts = rawPartsOf(base);
  if (baseParts.length > parts.length || baseParts.some((part, index) => parts[index] !== part)) {
    return [];
  }
  return parts.slice(baseParts.length);
}

export function urlFor(base: string, rawParts: readonly string[]): string {
  return rawParts.length ? `${base}/${rawParts.join('/')}` : base || '/';
}

const EMPTY_PARTS: SegmentParts = Object.freeze([]);

// A malformed escape means the segment cannot be read, so the location reports no parts rather
// than a half-decoded value that something downstream might decode again.
export function decodeParts(rawParts: readonly string[]): SegmentParts {
  try {
    return rawParts.map(part => decodeURIComponent(part));
  } catch {
    return EMPTY_PARTS;
  }
}

export function encodeParts(parts: SegmentParts): string[] {
  return parts.map(part => encodeURIComponent(part));
}

function useVirtualSegmentParts(base: string): SegmentParts {
  const url = useVirtualUrl();
  return useMemo(() => decodeParts(rawSegmentPartsOf(url, base)), [url, base]);
}

export function createVirtualLocation(basePath: string, write: (url: string) => void): MosaicLocation {
  const base = normalizeBase(basePath);
  return {
    useSegmentParts: () => useVirtualSegmentParts(base),
    write: parts => write(urlFor(base, encodeParts(parts))),
  };
}
