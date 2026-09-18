import type { ComponentPropsWithRef, ReactNode } from 'react';

export type ToastPriority = 'low' | 'high';

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
  /** True while the toast is queued beyond the provider `limit`. */
  limited?: boolean;
  /** Measured height of the root element, used to compute `--toast-offset-y` for the toasts stacked below it. */
  height?: number;
  onClose?: () => void;
  onRemove?: () => void;
  /** Props merged onto `Toast.Action`. Its `onClick` runs before the toast closes. */
  actionProps?: ComponentPropsWithRef<'button'>;
  data?: Record<string, unknown>;
}

export type ToastAddOptions = Omit<ToastObject, 'id' | 'transitionStatus' | 'limited' | 'height'> & { id?: string };

export type ToastUpdateOptions = Partial<ToastAddOptions>;

export type ToastUpdater = ToastUpdateOptions | ((toast: ToastObject) => ToastUpdateOptions);

type ToastPromiseResult<Value> = string | ToastUpdateOptions | ((value: Value) => string | ToastUpdateOptions);

export interface ToastPromiseOptions<Value> {
  loading: string | ToastUpdateOptions;
  success: ToastPromiseResult<Value>;
  error: ToastPromiseResult<unknown>;
}

export interface ToastManager {
  /** Adds a toast and returns its id. */
  add: (options: ToastAddOptions) => string;
  /** Starts the exit transition of one toast, or of every toast when called without an id. */
  close: (id?: string) => void;
  /** Merges new fields into a toast. A function receives the current toast and returns the fields to merge. */
  update: (id: string, options: ToastUpdater) => void;
  /** Shows a loading toast, then updates it with the success or error result. Re-throws on rejection. */
  promise: <Value>(promise: Promise<Value>, options: ToastPromiseOptions<Value>) => Promise<Value>;
}

export type ToastManagerEvent =
  | { action: 'add'; options: ToastAddOptions & { id: string } }
  | { action: 'close'; id: string | undefined }
  | { action: 'update'; id: string; options: ToastUpdater };

export interface ExternalToastManager extends ToastManager {
  subscribe: (listener: (event: ToastManagerEvent) => void) => () => void;
}

let toastCounter = 0;

export function generateToastId() {
  toastCounter += 1;
  return `toast-${toastCounter}`;
}

function resolvePromiseResult<Value>(result: ToastPromiseResult<Value>, value: Value): ToastUpdateOptions {
  const resolved = typeof result === 'function' ? result(value) : result;
  return typeof resolved === 'string' ? { title: resolved } : resolved;
}

/**
 * The `promise` flow expressed over `add` and `update`, so the provider and the
 * external manager behave identically.
 */
export function runToastPromise<Value>(
  api: Pick<ToastManager, 'add' | 'update'>,
  promise: Promise<Value>,
  options: ToastPromiseOptions<Value>,
): Promise<Value> {
  const loading = resolvePromiseResult(options.loading, undefined);
  const id = api.add({ timeout: 0, type: 'loading', ...loading });

  return promise.then(
    value => {
      api.update(id, { timeout: undefined, type: 'success', ...resolvePromiseResult(options.success, value) });
      return value;
    },
    (error: unknown) => {
      api.update(id, { timeout: undefined, type: 'error', ...resolvePromiseResult(options.error, error) });
      throw error;
    },
  );
}

/**
 * Creates a manager usable outside React. Pass it to `<Toast.Provider toastManager>`;
 * calls made before the provider mounts are dropped.
 */
export function createToastManager(): ExternalToastManager {
  const listeners = new Set<(event: ToastManagerEvent) => void>();

  const emit = (event: ToastManagerEvent) => {
    for (const listener of listeners) {
      listener(event);
    }
  };

  const manager: ExternalToastManager = {
    add: options => {
      const id = options.id ?? generateToastId();
      emit({ action: 'add', options: { ...options, id } });
      return id;
    },
    close: id => emit({ action: 'close', id }),
    update: (id, options) => emit({ action: 'update', id, options }),
    promise: (promise, options) => runToastPromise(manager, promise, options),
    subscribe: listener => {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
  };

  return manager;
}
