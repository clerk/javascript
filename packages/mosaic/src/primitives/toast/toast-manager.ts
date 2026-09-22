import type { ComponentPropsWithRef, ReactNode } from 'react';

export type ToastPriority = 'low' | 'high';

export type ToastSide = 'top' | 'bottom' | 'left' | 'right';

export type ToastAlign = 'start' | 'center' | 'end';

export interface ToastPositionerOptions {
  /** The element the toast is positioned against. */
  anchor?: Element | null;
  /** @default 'top' */
  side?: ToastSide;
  /** @default 'center' */
  align?: ToastAlign;
  /** Gap between the anchor and the toast, in px. @default 0 */
  sideOffset?: number;
  /** Shift along the alignment axis, in px. @default 0 */
  alignOffset?: number;
}

export interface ToastObject {
  id: string;
  title?: ReactNode;
  description?: ReactNode;
  /** Free-form category (`'success'`, `'error'`, …). Exposed as `data-type` on `Toast.Root`. */
  type?: string;
  /** Auto-dismiss delay in ms. `0` keeps the toast until it is closed. Falls back to the provider default. */
  timeout?: number;
  /** `'high'` announces with `role="alert"` and `aria-live="assertive"`. @default 'low' */
  priority?: ToastPriority;
  transitionStatus?: 'starting' | 'ending';
  /** True while the toast is beyond the provider `limit`. Its timer keeps running. */
  limited?: boolean;
  /** Measured height of the root element, used to compute `--toast-offset-y` for the toasts stacked below it. */
  height?: number;
  /** How many times `add` was called again with this toast's id while it was open. */
  repeatCount?: number;
  onClose?: () => void;
  onRemove?: () => void;
  /** Props merged onto `Toast.Action`. Its `onClick` runs before the toast closes. */
  actionProps?: ComponentPropsWithRef<'button'>;
  /** Positioning for `Toast.Positioner`. Overrides the props given to the positioner. A toast with an `anchor` stays out of the stack and the limit. */
  positionerProps?: ToastPositionerOptions;
  data?: Record<string, unknown>;
}

export type ToastAddOptions = Omit<ToastObject, 'id' | 'transitionStatus' | 'limited' | 'height' | 'repeatCount'> & {
  id?: string;
};

export type ToastUpdateOptions = Partial<ToastAddOptions>;

export type ToastUpdater = ToastUpdateOptions | ((toast: ToastObject) => ToastUpdateOptions);

type ToastPromiseResult<Value> = string | ToastUpdateOptions | ((value: Value) => string | ToastUpdateOptions);

export interface ToastPromiseOptions<Value> {
  loading: string | ToastUpdateOptions;
  success: ToastPromiseResult<Value>;
  error: ToastPromiseResult<unknown>;
}

export interface ToastManager {
  /** Adds a toast and returns its id. Adding an id that is already open updates that toast and restarts its timer instead. */
  add: (options: ToastAddOptions) => string;
  /** Starts the exit transition of one toast, or of every toast when called without an id. */
  close: (id?: string) => void;
  /** Merges new fields into a toast. A function receives the current toast and returns the fields to merge. */
  update: (id: string, options: ToastUpdater) => void;
  /** Shows a loading toast, then updates it with the success or error result. Re-throws on rejection. */
  promise: <Value>(promise: Promise<Value>, options: ToastPromiseOptions<Value>) => Promise<Value>;
}

export interface ExternalToastManager extends ToastManager {
  /** Drops the toast from the store. Called by `Toast.Root` once its exit animations finish. */
  remove: (id: string) => void;
  setHeight: (id: string, height: number) => void;
  subscribe: (listener: () => void) => () => void;
  getSnapshot: () => ToastObject[];
}

let toastCounter = 0;

export function isActive(toast: ToastObject) {
  return toast.transitionStatus !== 'ending';
}

export function isAnchored(toast: ToastObject) {
  return toast.positionerProps?.anchor != null;
}

function resolvePromiseResult<Value>(result: ToastPromiseResult<Value>, value: Value): ToastUpdateOptions {
  const resolved = typeof result === 'function' ? result(value) : result;
  return typeof resolved === 'string' ? { title: resolved } : resolved;
}

/**
 * Creates the store that holds the toasts. `Toast.Provider` creates one on its own;
 * create one yourself and pass it as `toastManager` to add toasts outside React.
 */
export function createToastManager(): ExternalToastManager {
  let toasts: ToastObject[] = [];
  const listeners = new Set<() => void>();

  const set = (next: ToastObject[]) => {
    toasts = next;
    for (const listener of listeners) {
      listener();
    }
  };

  const manager: ExternalToastManager = {
    add: options => {
      toastCounter += 1;
      const id = options.id ?? `toast-${toastCounter}`;
      const open = toasts.find(t => t.id === id && isActive(t));
      if (open) {
        set(toasts.map(t => (t === open ? { ...t, ...options, id, repeatCount: (t.repeatCount ?? 0) + 1 } : t)));
        return id;
      }
      const replaced = toasts.find(t => t.id === id);
      set([{ ...options, id, transitionStatus: 'starting' }, ...toasts.filter(t => t !== replaced)]);
      replaced?.onRemove?.();
      return id;
    },
    close: id => {
      const closing = toasts.filter(t => isActive(t) && (id === undefined || t.id === id));
      if (closing.length === 0) {
        return;
      }
      set(toasts.map(t => (closing.includes(t) ? { ...t, transitionStatus: 'ending' } : t)));
      for (const toast of closing) {
        toast.onClose?.();
      }
    },
    remove: id => {
      const toast = toasts.find(t => t.id === id);
      if (!toast) {
        return;
      }
      set(toasts.filter(t => t !== toast));
      toast.onRemove?.();
    },
    update: (id, options) => {
      set(toasts.map(t => (t.id === id ? { ...t, ...(typeof options === 'function' ? options(t) : options), id } : t)));
    },
    promise: (promise, options) => {
      const id = manager.add({ timeout: 0, type: 'loading', ...resolvePromiseResult(options.loading, undefined) });
      return promise.then(
        value => {
          manager.update(id, { timeout: undefined, type: 'success', ...resolvePromiseResult(options.success, value) });
          return value;
        },
        (error: unknown) => {
          manager.update(id, { timeout: undefined, type: 'error', ...resolvePromiseResult(options.error, error) });
          throw error;
        },
      );
    },
    setHeight: (id, height) => {
      if (toasts.some(t => t.id === id && t.height !== height)) {
        set(toasts.map(t => (t.id === id ? { ...t, height } : t)));
      }
    },
    subscribe: listener => {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    getSnapshot: () => toasts,
  };

  return manager;
}
