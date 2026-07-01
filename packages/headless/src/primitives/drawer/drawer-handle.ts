'use client';

/**
 * An imperative handle for opening a drawer from a trigger that lives outside
 * `Drawer.Root` (a "detached" trigger). Create one with {@link createDrawerHandle},
 * pass it to both `Drawer.Root` and `Drawer.Trigger`, and they share a single
 * open state. The store is `useSyncExternalStore`-compatible.
 */
export interface DrawerHandle {
  open(): void;
  close(): void;
  toggle(): void;
  readonly isOpen: boolean;
  subscribe(callback: () => void): () => void;
}

export function createDrawerHandle(): DrawerHandle {
  let isOpen = false;
  const listeners = new Set<() => void>();

  const set = (next: boolean): void => {
    if (next === isOpen) {
      return;
    }
    isOpen = next;
    for (const listener of listeners) {
      listener();
    }
  };

  return {
    open: () => set(true),
    close: () => set(false),
    toggle: () => set(!isOpen),
    get isOpen() {
      return isOpen;
    },
    subscribe(callback) {
      listeners.add(callback);
      return () => {
        listeners.delete(callback);
      };
    },
  };
}
