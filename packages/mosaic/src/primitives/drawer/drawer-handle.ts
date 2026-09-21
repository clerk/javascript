'use client';

/**
 * @internal The connection a mounted `Drawer.Root` gives the handle: a setter
 * that runs the real open/close (firing `onOpenChange` and respecting a
 * controlled `open` prop) and a getter for the root's current open state.
 */
export interface DrawerHandleController {
  setOpen: (open: boolean) => void;
  getOpen: () => boolean;
}

/**
 * An imperative handle for opening a drawer from a trigger that lives outside
 * `Drawer.Root` (a "detached" trigger). Create one with {@link createDrawerHandle},
 * pass it to both `Drawer.Root` and `Drawer.Trigger`, and they share a single
 * open state.
 *
 * `Drawer.Root` remains the single source of truth (it owns `open` / `defaultOpen`
 * / `onOpenChange`); the handle is a bridge. Imperative calls route back through
 * the root's `setOpen`, so `onOpenChange` always fires, and `isOpen` reflects the
 * root. The store is `useSyncExternalStore`-compatible.
 */
export interface DrawerHandle {
  open(): void;
  close(): void;
  toggle(): void;
  readonly isOpen: boolean;
  subscribe(callback: () => void): () => void;
  /**
   * @internal Connect the owning `Drawer.Root`. Returns a disconnect callback.
   */
  connect(controller: DrawerHandleController): () => void;
  /**
   * @internal The root calls this after each open change so external subscribers
   * (e.g. a detached `Drawer.Trigger`) re-read `isOpen`.
   */
  emit(): void;
}

export function createDrawerHandle(): DrawerHandle {
  let controller: DrawerHandleController | null = null;
  // Open state used only while no `Drawer.Root` is connected (e.g. an imperative
  // `open()` before mount). `touched` records that it was set deliberately so a
  // connecting root can adopt it without clobbering its own `defaultOpen`.
  let buffered = false;
  let touched = false;
  const listeners = new Set<() => void>();

  const emit = (): void => {
    for (const listener of listeners) {
      listener();
    }
  };

  const command = (next: boolean): void => {
    if (controller) {
      controller.setOpen(next);
      return;
    }
    buffered = next;
    touched = true;
    emit();
  };

  return {
    open: () => command(true),
    close: () => command(false),
    toggle: () => command(!(controller ? controller.getOpen() : buffered)),
    get isOpen() {
      return controller ? controller.getOpen() : buffered;
    },
    subscribe(callback) {
      listeners.add(callback);
      return () => {
        listeners.delete(callback);
      };
    },
    connect(next) {
      controller = next;
      // Adopt an open/close requested imperatively before the root mounted.
      if (touched && buffered !== next.getOpen()) {
        next.setOpen(buffered);
      }
      touched = false;
      emit();
      return () => {
        controller = null;
        emit();
      };
    },
    emit,
  };
}
