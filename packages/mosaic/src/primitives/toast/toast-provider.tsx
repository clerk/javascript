'use client';

import { type ReactNode, useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react';

import { ToastContext, type ToastContextValue } from './toast-context';
import { createToastManager, type ExternalToastManager, isActive, type ToastObject } from './toast-manager';

export interface ToastProviderProps {
  children: ReactNode;
  /** Default auto-dismiss delay in ms. `0` disables auto-dismiss. @default 5000 */
  timeout?: number;
  /** Maximum number of toasts shown at once. Newer toasts queue the oldest ones as `limited`. @default 3 */
  limit?: number;
  /** A manager from `createToastManager()`, for adding toasts outside React. */
  toastManager?: ExternalToastManager;
}

function applyLimit(toasts: ToastObject[], limit: number): ToastObject[] {
  let active = 0;
  return toasts.map(toast => {
    if (!isActive(toast)) {
      return toast;
    }
    active += 1;
    return active > limit ? { ...toast, limited: true } : toast;
  });
}

export function ToastProvider(props: ToastProviderProps) {
  const { children, timeout = 5000, limit = 3, toastManager } = props;

  const ownManagerRef = useRef<ExternalToastManager | null>(null);
  ownManagerRef.current ??= createToastManager();
  const manager = toastManager ?? ownManagerRef.current;

  const storedToasts = useSyncExternalStore(manager.subscribe, manager.getSnapshot, manager.getSnapshot);
  const toasts = useMemo(() => applyLimit(storedToasts, limit), [storedToasts, limit]);

  const [hovering, setHovering] = useState(false);
  const [focused, setFocused] = useState(false);
  const [windowFocused, setWindowFocused] = useState(true);
  const [documentVisible, setDocumentVisible] = useState(true);

  const rootElementsRef = useRef(new Map<string, HTMLElement>());
  const viewportRef = useRef<HTMLElement | null>(null);
  const prevFocusRef = useRef<HTMLElement | null>(null);

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

  const registerRoot = useCallback((id: string, element: HTMLElement) => {
    rootElementsRef.current.set(id, element);
    return () => {
      rootElementsRef.current.delete(id);
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

  useEffect(() => {
    const index = toasts.findIndex(
      t => !isActive(t) && rootElementsRef.current.get(t.id)?.contains(document.activeElement),
    );
    if (index === -1) {
      return;
    }
    const focusable = (t: ToastObject) => isActive(t) && !t.limited;
    const next = toasts.slice(index + 1).find(focusable) ?? toasts.slice(0, index).reverse().find(focusable);
    if (next) {
      focusToast(next.id);
      return;
    }
    const previous = prevFocusRef.current;
    if (previous?.isConnected) {
      previous.focus();
    }
    setFocused(false);
  }, [toasts, focusToast]);

  const expanded = hovering || focused;
  const paused = expanded || !windowFocused || !documentVisible;
  const frontmost = toasts.find(isActive) ?? toasts[0];

  const contextValue = useMemo<ToastContextValue>(
    () => ({
      ...manager,
      toasts,
      timeout,
      paused,
      expanded,
      frontmost,
      setHovering,
      setFocused,
      registerRoot,
      focusToast,
      viewportRef,
      prevFocusRef,
    }),
    [manager, toasts, timeout, paused, expanded, frontmost, registerRoot, focusToast],
  );

  return <ToastContext.Provider value={contextValue}>{children}</ToastContext.Provider>;
}
