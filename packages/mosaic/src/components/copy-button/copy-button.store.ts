import { useSyncExternalStore } from 'react';

let copiedId: string | null = null;
let timer: ReturnType<typeof setTimeout> | undefined;
const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function emit() {
  listeners.forEach(listener => listener());
}

export function setCopied(id: string | null, resetAfter?: number) {
  clearTimeout(timer);
  copiedId = id;
  if (id !== null && resetAfter !== undefined) {
    timer = setTimeout(() => setCopied(null), resetAfter);
  }
  emit();
}

export function clearCopied(id: string) {
  if (copiedId === id) {
    setCopied(null);
  }
}

export function useCopiedId() {
  return useSyncExternalStore(
    subscribe,
    () => copiedId,
    () => null,
  );
}
