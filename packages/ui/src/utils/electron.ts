import type { ClerkElectronBridge } from '@clerk/shared/types';

/**
 * The bridge is injected exclusively by our Electron preload, so its presence is the native-flow
 * signal. We deliberately do not sniff the renderer user-agent: OAuth runs in the system browser, so
 * the renderer UA is irrelevant, and some Electron apps strip "Electron" from it (e.g. to avoid
 * Google's `disallowed_useragent`), which would otherwise hide an injected bridge.
 */
export function getClerkElectronBridge(): ClerkElectronBridge | undefined {
  if (typeof window === 'undefined') {
    return;
  }

  return window.__clerk_internal_electron;
}
