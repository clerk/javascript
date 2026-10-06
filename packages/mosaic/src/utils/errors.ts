import { isClerkAPIResponseError, isClerkRuntimeError } from '@clerk/shared/error';
import { snakeToCamel } from '@clerk/shared/underscore';

import type { ErrorDescription, LocalizableError, MessageValues } from '../localization';

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

/** Reads every error a Clerk failure carries, or `undefined` when the cause is not from Clerk. */
function toClerkErrors(cause: unknown, params?: MessageValues): LocalizableError[] | undefined {
  if (!(cause instanceof Error)) {
    return undefined;
  }
  if (isClerkRuntimeError(cause)) {
    return [
      {
        code: cause.code,
        ...(cause.longMessage ? { message: cause.longMessage } : {}),
        ...(params ? { params } : {}),
      },
    ];
  }
  if (!isClerkAPIResponseError(cause)) {
    return undefined;
  }
  return cause.errors.map(error => {
    const paramName = error.meta?.paramName;
    return {
      code: error.code,
      ...(paramName ? { paramName } : {}),
      message: error.longMessage || error.message,
      ...(params ? { params } : {}),
    };
  });
}

function toClerkFormError<TField extends string>(
  cause: unknown,
  fields: readonly TField[],
  params: MessageValues | undefined,
): FormError<TField> | undefined {
  const errors = toClerkErrors(cause, params);
  if (!errors) {
    return undefined;
  }
  const formError: FormError<TField> = {};
  for (const error of errors) {
    const field = fields.find(f => error.paramName && snakeToCamel(error.paramName) === f);
    if (field) {
      formError.fields = { ...formError.fields, [field]: formError.fields?.[field] ?? error };
    } else {
      formError.global ??= error;
    }
  }
  return formError;
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

/**
 * Reads what to tell the user about a failed action. A Clerk error keeps its code so the catalog can
 * localize it; anything else keeps its cause, is logged, and renders as the caller's fallback.
 */
export function toLocalizableError(cause: unknown): ErrorDescription {
  const error =
    cause instanceof SaveError
      ? (cause.formError.global ?? Object.values(cause.formError.fields ?? {}).find(field => field !== undefined))
      : toClerkErrors(cause)?.[0];
  if (error) {
    return error;
  }
  console.error('[Clerk] Could not localize error', cause);
  return { cause };
}

/** Reads what a rejected save left for the view. An unrecognized rejection is the generic error. */
export function toFormError<TField extends string = string>(cause: unknown): FormError<TField> {
  if (cause instanceof SaveError) {
    return cause.formError;
  }
  console.error('[Clerk] Could not localize error', cause);
  return { global: UNEXPECTED_ERROR };
}
