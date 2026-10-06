'use client';

import { useMemo } from 'react';

import { useToastContext } from './toast-context';
import type { ToastManager, ToastObject } from './toast-manager';

export interface UseToastManagerReturn extends ToastManager {
  toasts: ToastObject[];
}

export function useToastManager(): UseToastManagerReturn {
  const { toasts, add, close, update, promise } = useToastContext();
  return useMemo(() => ({ toasts, add, close, update, promise }), [toasts, add, close, update, promise]);
}
