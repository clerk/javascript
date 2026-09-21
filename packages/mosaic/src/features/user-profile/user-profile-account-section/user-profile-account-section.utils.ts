import { isClerkAPIResponseError, isReverificationCancelledError } from '@clerk/shared/error';
import type { AttributeData } from '@clerk/shared/types';

import type { UserProfileFormError, UserProfileSaveResult } from './user-profile-account-section.types';

export function isAttributeAvailable(attribute: AttributeData | undefined): boolean {
  return Boolean(attribute?.enabled || attribute?.used_for_first_factor || attribute?.used_for_second_factor);
}

function snakeToCamel(value: string): string {
  return value.replace(/_([a-z])/g, (_, letter: string) => letter.toUpperCase());
}

export function toUserProfileFormError<TField extends string>(
  cause: unknown,
  fields: readonly TField[],
): UserProfileFormError<TField> {
  if (!isClerkAPIResponseError(cause)) {
    return { message: cause instanceof Error ? cause.message : 'Something went wrong. Please try again.' };
  }
  const error: UserProfileFormError<TField> = {};
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
): Promise<UserProfileSaveResult<TField>> {
  try {
    await run();
    return { error: null };
  } catch (cause) {
    if (isReverificationCancelledError(cause)) {
      return { error: { kind: 'cancelled' } };
    }
    return { error: { kind: 'form', ...toUserProfileFormError(cause, fields) } };
  }
}
