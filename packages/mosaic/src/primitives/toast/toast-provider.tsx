'use client';

import { type ReactNode, useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { ToastContext, type ToastContextValue } from './toast-context';
import {
  type ExternalToastManager,
  generateToastId,
  runToastPromise,
  type ToastAddOptions,
  type ToastObject,
  type ToastPromiseOptions,
  type ToastUpdater,
} from './toast-manager';

export interface ToastProviderProps {
  children: ReactNode;
  /** Default auto-dismiss delay in ms. `0` disables auto-dismiss. @default 5000 */
  timeout?: number;
  /** Maximum number of toasts shown at once. Newer toasts queue the oldest ones as `limited`. @default 3 */
  limit?: number;
  /** A manager from `createToastManager()`, for adding toasts outside React. */
  toastManager?: ExternalToastManager;
}

interface Timer {
  timeout: number;
  remaining: number;
  start: number;
  timeoutId: ReturnType<typeof setTimeout> | undefined;
  callback: () => void;
}

function isActive(toast: ToastObject) {
  return toast.transitionStatus !== 'ending';
}

function applyLimit(toasts: ToastObject[], limit: number): ToastObject[] {
  let active = 0;
  return toasts.map(toast => {
    if (!isActive(toast)) {
      return toast;
    }
    active += 1;
    const limited = active > limit;
    return toast.limited === limited ? toast : { ...toast, limited };
  });
}

export function ToastProvider(props: ToastProviderProps) {
  const { children, timeout: defaultTimeout = 5000, limit = 3, toastManager } = props;

  const [toasts, setToasts] = useState<ToastObject[]>([]);
  const [hovering, setHovering] = useState(false);
  const [focused, setFocused] = useState(false);
  const [windowFocused, setWindowFocused] = useState(true);
  const [documentVisible, setDocumentVisible] = useState(true);

  const toastsRef = useRef(toasts);
  toastsRef.current = toasts;

  const timersRef = useRef(new Map<string, Timer>());
  const rootElementsRef = useRef(new Map<string, HTMLElement>());
  const viewportRef = useRef<HTMLElement | null>(null);
  const prevFocusRef = useRef<HTMLElement | null>(null);

  const paused = hovering || focused || !windowFocused || !documentVisible;
  const pausedRef = useRef(paused);
  pausedRef.current = paused;

  const clearTimer = useCallback((id: string) => {
    const timer = timersRef.current.get(id);
    if (timer?.timeoutId !== undefined) {
      clearTimeout(timer.timeoutId);
    }
    timersRef.current.delete(id);
  }, []);

  const scheduleTimer = useCallback(
    (id: string, timeout: number, callback: () => void) => {
      clearTimer(id);
      const timer: Timer = { timeout, remaining: timeout, start: Date.now(), timeoutId: undefined, callback };
      if (!pausedRef.current) {
        timer.timeoutId = setTimeout(callback, timeout);
      }
      timersRef.current.set(id, timer);
    },
    [clearTimer],
  );

  useEffect(() => {
    const timers = timersRef.current;
    if (paused) {
      for (const timer of timers.values()) {
        if (timer.timeoutId === undefined) {
          continue;
        }
        clearTimeout(timer.timeoutId);
        timer.timeoutId = undefined;
        timer.remaining = Math.max(0, timer.remaining - (Date.now() - timer.start));
      }
      return;
    }
    for (const timer of timers.values()) {
      if (timer.timeoutId !== undefined) {
        continue;
      }
      timer.start = Date.now();
      timer.timeoutId = setTimeout(timer.callback, timer.remaining);
    }
  }, [paused]);

  useEffect(() => {
    const onBlur = () => setWindowFocused(false);
    const onFocus = () => setWindowFocused(true);
    const onVisibilityChange = () => setDocumentVisible(document.visibilityState !== 'hidden');
    window.addEventListener('blur', onBlur);
    window.addEventListener('focus', onFocus);
    document.addEventListener('visibilitychange', onVisibilityChange);
    return () => {
      window.removeEventListener('blur', onBlur);
      window.removeEventListener('focus', onFocus);
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }, []);

  useEffect(() => {
    const timers = timersRef.current;
    return () => {
      for (const timer of timers.values()) {
        if (timer.timeoutId !== undefined) {
          clearTimeout(timer.timeoutId);
        }
      }
      timers.clear();
    };
  }, []);

  const focusToast = useCallback((id: string) => {
    const element = rootElementsRef.current.get(id);
    if (!element) {
      return false;
    }
    element.focus();
    return true;
  }, []);

  const close = useCallback(
    (id?: string) => {
      const current = toastsRef.current;
      const closing = current.filter(t => isActive(t) && (id === undefined || t.id === id));
      if (closing.length === 0) {
        return;
      }

      const closingIds = new Set(closing.map(t => t.id));
      for (const toast of closing) {
        clearTimer(toast.id);
      }

      const focusedToast = closing.find(t => rootElementsRef.current.get(t.id)?.contains(document.activeElement));
      if (focusedToast) {
        const index = current.indexOf(focusedToast);
        const focusable = (t: ToastObject) => !closingIds.has(t.id) && isActive(t) && !t.limited;
        const next = current.slice(index + 1).find(focusable) ?? current.slice(0, index).reverse().find(focusable);
        if (next) {
          focusToast(next.id);
        } else {
          const previous = prevFocusRef.current;
          if (previous?.isConnected) {
            previous.focus();
          }
          setFocused(false);
        }
      }

      setToasts(prev =>
        applyLimit(
          prev.map(t => (closingIds.has(t.id) ? { ...t, transitionStatus: 'ending' as const } : t)),
          limit,
        ),
      );
      for (const toast of closing) {
        toast.onClose?.();
      }
    },
    [clearTimer, focusToast, limit],
  );

  const remove = useCallback(
    (id: string) => {
      const toast = toastsRef.current.find(t => t.id === id);
      if (!toast) {
        return;
      }
      clearTimer(id);
      setToasts(prev =>
        applyLimit(
          prev.filter(t => t.id !== id),
          limit,
        ),
      );
      toast.onRemove?.();
    },
    [clearTimer, limit],
  );

  const add = useCallback(
    (options: ToastAddOptions) => {
      const id = options.id ?? generateToastId();
      const toast: ToastObject = { ...options, id, transitionStatus: 'starting' };
      setToasts(prev => applyLimit([toast, ...prev.filter(t => t.id !== id)], limit));
      return id;
    },
    [limit],
  );

  const update = useCallback((id: string, options: ToastUpdater) => {
    setToasts(prev =>
      prev.map(t => (t.id === id ? { ...t, ...(typeof options === 'function' ? options(t) : options), id } : t)),
    );
  }, []);

  const promise = useCallback(
    <Value,>(value: Promise<Value>, options: ToastPromiseOptions<Value>) =>
      runToastPromise({ add, update }, value, options),
    [add, update],
  );

  useEffect(() => {
    for (const toast of toasts) {
      const timeout = toast.timeout ?? defaultTimeout;
      const existing = timersRef.current.get(toast.id);
      if (!isActive(toast) || toast.limited || timeout <= 0) {
        clearTimer(toast.id);
        continue;
      }
      if (existing?.timeout !== timeout) {
        scheduleTimer(toast.id, timeout, () => close(toast.id));
      }
    }
  }, [toasts, defaultTimeout, clearTimer, scheduleTimer, close]);

  useEffect(() => {
    if (!toastManager) {
      return;
    }
    return toastManager.subscribe(event => {
      switch (event.action) {
        case 'add':
          add(event.options);
          break;
        case 'close':
          close(event.id);
          break;
        case 'update':
          update(event.id, event.options);
          break;
      }
    });
  }, [toastManager, add, close, update]);

  const setHeight = useCallback((id: string, height: number) => {
    setToasts(prev => {
      const toast = prev.find(t => t.id === id);
      if (!toast || toast.height === height) {
        return prev;
      }
      return prev.map(t => (t.id === id ? { ...t, height } : t));
    });
  }, []);

  const registerRoot = useCallback((id: string, element: HTMLElement) => {
    rootElementsRef.current.set(id, element);
    return () => {
      rootElementsRef.current.delete(id);
    };
  }, []);

  const expanded = hovering || focused;
  const frontmost = toasts.find(isActive) ?? toasts[0];

  const contextValue = useMemo<ToastContextValue>(
    () => ({
      toasts,
      add,
      close,
      update,
      promise,
      remove,
      expanded,
      frontmost,
      setHovering,
      setFocused,
      setHeight,
      registerRoot,
      focusToast,
      viewportRef,
      prevFocusRef,
    }),
    [toasts, add, close, update, promise, remove, expanded, frontmost, setHeight, registerRoot, focusToast],
  );

  return <ToastContext.Provider value={contextValue}>{children}</ToastContext.Provider>;
}
