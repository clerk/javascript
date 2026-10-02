import { useEffect, useSyncExternalStore } from 'react';

import type { ProviderLogoGlyph } from './provider-logo.glyphs.generated';
import type { ProviderLogoId } from './provider-logo.ids.generated';

type Glyphs = Record<ProviderLogoId, ProviderLogoGlyph>;

let glyphs: Glyphs | null = null;
let pending: Promise<void> | null = null;
const listeners = new Set<() => void>();

export function preloadProviderLogos(): Promise<void> {
  pending ??= import('./provider-logo.glyphs.generated').then(
    module => {
      glyphs = module.providerLogoGlyphs;
      listeners.forEach(listener => listener());
    },
    error => {
      pending = null;
      throw error;
    },
  );
  return pending;
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function useProviderLogoGlyphs(): Glyphs | null {
  const current = useSyncExternalStore(
    subscribe,
    () => glyphs,
    () => null,
  );
  useEffect(() => {
    if (!current) {
      preloadProviderLogos().catch(() => {});
    }
  }, [current]);
  return current;
}
