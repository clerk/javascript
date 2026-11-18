'use client';

import { type ReactNode, useMemo } from 'react';

import {
  Toast as Primitive,
  type ToastAddOptions as PrimitiveAddOptions,
  type ToastObject as PrimitiveObject,
  type ToastUpdateOptions as PrimitiveUpdateOptions,
} from '../../primitives/toast';

type WithLabel<T> = Omit<T, 'title'> & { label?: ReactNode };

export type ToastObject = WithLabel<PrimitiveObject>;

export type ToastOptions = WithLabel<PrimitiveAddOptions>;

export type ToastUpdateOptions = WithLabel<PrimitiveUpdateOptions>;

type ToastPromiseResult<Value> = string | ToastUpdateOptions | ((value: Value) => string | ToastUpdateOptions);

export interface ToastPromiseOptions<Value> {
  loading: string | ToastUpdateOptions;
  success: ToastPromiseResult<Value>;
  error: ToastPromiseResult<unknown>;
}

export interface ToastManager {
  toasts: ToastObject[];
  add: (options: ToastOptions) => string;
  close: (id?: string) => void;
  update: (id: string, options: ToastUpdateOptions | ((toast: ToastObject) => ToastUpdateOptions)) => void;
  promise: <Value>(promise: Promise<Value>, options: ToastPromiseOptions<Value>) => Promise<Value>;
}

function toTitle<Options extends { label?: ReactNode }>(options: Options) {
  const { label, ...rest } = options;
  return 'label' in options ? { ...rest, title: label } : rest;
}

function toLabel(toast: PrimitiveObject): ToastObject {
  const { title, ...rest } = toast;
  return { ...rest, label: title };
}

function toTitleValue(value: string | ToastUpdateOptions) {
  return typeof value === 'string' ? value : toTitle(value);
}

function toTitleResult<Value>(result: ToastPromiseResult<Value>) {
  return typeof result === 'function' ? (value: Value) => toTitleValue(result(value)) : toTitleValue(result);
}

export function useToastManager(): ToastManager {
  const manager = Primitive.useToastManager();
  return useMemo(
    () => ({
      toasts: manager.toasts.map(toLabel),
      add: options => manager.add(toTitle(options)),
      close: manager.close,
      update: (id, options) =>
        manager.update(
          id,
          typeof options === 'function' ? toast => toTitle(options(toLabel(toast))) : toTitle(options),
        ),
      promise: (promise, options) =>
        manager.promise(promise, {
          loading: toTitleValue(options.loading),
          success: toTitleResult(options.success),
          error: toTitleResult(options.error),
        }),
    }),
    [manager],
  );
}
