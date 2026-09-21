import { isClerkAPIResponseError, isReverificationCancelledError } from '@clerk/shared/error';
import { snakeToCamel } from '@clerk/shared/underscore';

/** Plain data, so nothing downstream of the model imports a Clerk error. */
export interface FormError<TField extends string = string> {
  /** Rendered in the dialog's negative banner. */
  message?: string;
  /** Rendered under the named control, which is also marked invalid. */
  fields?: Partial<Record<TField, string>>;
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

export function toFormError<TField extends string>(cause: unknown, fields: readonly TField[]): FormError<TField> {
  if (!isClerkAPIResponseError(cause)) {
    return { message: cause instanceof Error ? cause.message : 'Something went wrong. Please try again.' };
  }
  const error: FormError<TField> = {};
  for (const apiError of cause.errors) {
    const text = apiError.longMessage || apiError.message;
    const field = fields.find(f => apiError.meta?.paramName && snakeToCamel(apiError.meta.paramName) === f);
    if (field) {
      error.fields = { ...error.fields, [field]: error.fields?.[field] ?? text };
    } else {
      error.message ??= text;
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
    return { error: { kind: 'form', ...toFormError(cause, fields) } };
  }
}
