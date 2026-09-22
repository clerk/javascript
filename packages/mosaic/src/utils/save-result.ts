import { isClerkAPIResponseError, isClerkRuntimeError } from '@clerk/shared/error';
import { snakeToCamel } from '@clerk/shared/underscore';

import type { LocalizableError } from '../localization';

export interface FormError<TField extends string = string> {
  global?: LocalizableError;
  fields?: Partial<Record<TField, LocalizableError>>;
}

export interface SaveResult<TField extends string = never> {
  error: FormError<TField> | null;
}

export const UNEXPECTED_ERROR: LocalizableError = { code: 'generic' };

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
    const error = toFormError(cause, fields);
    if (!error) {
      throw cause;
    }
    return { error };
  }
}
