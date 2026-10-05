import { isClerkAPIResponseError, isClerkRuntimeError } from '@clerk/shared/error';
import { snakeToCamel } from '@clerk/shared/underscore';

import type { LocalizableError, MessageValues } from '../localization';

export interface FormError<TField extends string = string> {
  global?: LocalizableError;
  fields?: Partial<Record<TField, LocalizableError>>;
}

export const UNEXPECTED_ERROR: LocalizableError = { code: 'generic' };

/** What a save rejects with when the failure is the user's to fix; anything else propagates. */
export class SaveError<TField extends string = string> extends Error {
  readonly formError: FormError<TField>;

  constructor(formError: FormError<TField>) {
    super(formError.global?.message ?? 'Save failed');
    this.name = 'SaveError';
    this.formError = formError;
  }
}

function toClerkFormError<TField extends string>(
  cause: unknown,
  fields: readonly TField[],
  params: MessageValues | undefined,
): FormError<TField> | undefined {
  if (isClerkRuntimeError(cause)) {
    return {
      global: {
        code: cause.code,
        ...(cause.longMessage ? { message: cause.longMessage } : {}),
        ...(params ? { params } : {}),
      },
    };
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
      ...(params ? { params } : {}),
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

/**
 * Runs a save and rejects with a `SaveError` the view can render. `fields` names the controls the
 * failure may be routed to; an error that names none of them lands in `global`. `params` carries
 * the instance settings a failure's message may need to read — the length bounds a username was
 * measured against, say — since only the caller's layer can resolve them.
 */
export async function save<TField extends string = never>(
  run: () => Promise<unknown>,
  fields: readonly TField[] = [],
  params?: MessageValues,
): Promise<void> {
  try {
    await run();
  } catch (cause) {
    const formError = toClerkFormError(cause, fields, params);
    if (!formError) {
      throw cause;
    }
    throw new SaveError(formError);
  }
}

/** Reads what a rejected save left for the view. An unrecognized rejection is the generic error. */
export function toFormError<TField extends string = string>(cause: unknown): FormError<TField> {
  if (cause instanceof SaveError) {
    return cause.formError;
  }
  console.error(cause);
  return { global: UNEXPECTED_ERROR };
}
