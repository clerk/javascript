import { createContext, type MutableRefObject, type RefObject, useContext } from 'react';

import type { ToastManager, ToastObject } from './toast-manager';

export interface ToastContextValue extends ToastManager {
  toasts: ToastObject[];
  /** Drops the toast from state. Called by `Toast.Root` once its exit animations finish. */
  remove: (id: string) => void;
  /** True while the viewport is hovered or holds focus. Timers are paused and roots carry `data-expanded`. */
  expanded: boolean;
  /** The newest toast that is not closing. Its height sizes the collapsed stack. */
  frontmost: ToastObject | undefined;
  setHovering: (hovering: boolean) => void;
  setFocused: (focused: boolean) => void;
  setHeight: (id: string, height: number) => void;
  registerRoot: (id: string, element: HTMLElement) => () => void;
  focusToast: (id: string) => boolean;
  viewportRef: RefObject<HTMLElement | null>;
  /** The element focus returns to when the last focused toast closes or F6 leaves the viewport. */
  prevFocusRef: MutableRefObject<HTMLElement | null>;
}

export const ToastContext = createContext<ToastContextValue | null>(null);

export function useToastContext() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('Toast compound components must be used within <Toast.Provider>');
  }
  return ctx;
}

export interface ToastRootContextValue {
  toast: ToastObject;
  /** True for every toast stacked behind the frontmost one. */
  behind: boolean;
  rootId: string;
  titleId: string | undefined;
  descriptionId: string | undefined;
  setTitleId: (id: string | undefined) => void;
  setDescriptionId: (id: string | undefined) => void;
}

export const ToastRootContext = createContext<ToastRootContextValue | null>(null);

export function useToastRootContext() {
  const ctx = useContext(ToastRootContext);
  if (!ctx) {
    throw new Error('Toast parts must be used within <Toast.Root>');
  }
  return ctx;
}
