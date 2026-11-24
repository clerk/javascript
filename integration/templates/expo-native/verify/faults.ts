import { useSyncExternalStore } from 'react';

type FetchInput = Parameters<typeof fetch>[0];

const listeners = new Set<() => void>();
let installed = false;
let armed = 0;
let dropped = 0;
let signOutArmed = false;
let droppedSignOuts = 0;

function isClientFetch(input: FetchInput, init: RequestInit | undefined): boolean {
  const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;
  const method = init?.method ?? (input instanceof Request ? input.method : 'GET');
  return method === 'GET' && url.split('?')[0].endsWith('/v1/client');
}

function isSignOutRequest(input: FetchInput): boolean {
  const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;
  const { pathname, searchParams } = new URL(url);
  return pathname.endsWith('/v1/client/sessions') && searchParams.get('_method') === 'DELETE';
}

export function installFetchFaults(): void {
  installed = true;
  const send = globalThis.fetch;
  globalThis.fetch = async (input, init) => {
    if (armed > 0 && isClientFetch(input, init)) {
      armed -= 1;
      dropped += 1;
      listeners.forEach(listener => listener());
      throw new TypeError('Network request failed');
    }
    if (signOutArmed && isSignOutRequest(input)) {
      signOutArmed = false;
      droppedSignOuts += 1;
      listeners.forEach(listener => listener());
      throw new TypeError('Network request failed');
    }
    return send(input, init);
  };
}

export function fetchFaultsInstalled(): boolean {
  return installed;
}

export function armClientFetchDrop(): void {
  armed += 1;
}

export function useDroppedClientFetches(): number {
  return useSyncExternalStore(
    onChange => {
      listeners.add(onChange);
      return () => listeners.delete(onChange);
    },
    () => dropped,
  );
}

export function armSignOutDrop(): void {
  signOutArmed = true;
}

export function useDroppedSignOuts(): number {
  return useSyncExternalStore(
    onChange => {
      listeners.add(onChange);
      return () => listeners.delete(onChange);
    },
    () => droppedSignOuts,
  );
}
