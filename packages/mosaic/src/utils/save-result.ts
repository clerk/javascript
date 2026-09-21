import { isClerkAPIResponseError, isClerkRuntimeError, isReverificationCancelledError } from '@clerk/shared/error';
import { snakeToCamel } from '@clerk/shared/underscore';

import type { LocalizableError } from '../localization';

export interface FormError<TField extends string = string> {
  global?: LocalizableError;
  fields?: Partial<Record<TField, LocalizableError>>;
}

export type SaveFailure<TField extends string = never> = { kind: 'cancelled' } | ({ kind: 'form' } & FormError<TField>);

export interface SaveResult<TField extends string = never> {
  error: SaveFailure<TField> | null;
}

export function formErrorOf<TField extends string>(failure: SaveFailure<TField> | null): FormError<TField> | undefined {
  if (failure?.kind !== 'form') {
    return undefined;
  }
  const { kind: _kind, ...error } = failure;
  return error;
}

export function unexpectedFormError(cause: unknown): FormError<never> {
  console.error(cause);
  return { global: {} };
}

function toFormError<TField extends string>(cause: unknown, fields: readonly TField[]): FormError<TField> | undefined {
  if (isClerkRuntimeError(cause)) {
    return { global: { code: cause.code, ...(cause.longMessage ? { message: cause.longMessage } : {}) } };
  }
  if (!isClerkAPIResponseError(cause)) {
    return undefined;
  }
  const error: FormError<TField> = {};
  for (const apiError of cause.errors) {
    const paramName = apiError.meta?.paramName;
    const localizable: LocalizableError = {
      code: apiError.code,
      ...(paramName ? { paramName } : {}),
      message: apiError.longMessage || apiError.message,
    };
    const field = fields.find(f => paramName && snakeToCamel(paramName) === f);
    if (field) {
      error.fields = { ...error.fields, [field]: error.fields?.[field] ?? localizable };
    } else {
      error.global ??= localizable;
    }
  }
  return error;
}

export async function toSaveResult<TField extends string = never>(
  run: () => Promise<unknown>,
  fields: readonly TField[] = [],
): Promise<SaveResult<TField>> {
  try {
    await run();
    return { error: null };
  } catch (cause) {
    if (isReverificationCancelledError(cause)) {
      return { error: { kind: 'cancelled' } };
    }
    const error = toFormError(cause, fields);
    if (!error) {
      throw cause;
    }
    return { error: { kind: 'form', ...error } };
  }
}
