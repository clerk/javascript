import { isClerkAPIResponseError } from '@clerk/shared/error';

import type { LocalizableError } from '../../../localization';
import { toLocalizableApiError } from '../../../localization';

export function enterpriseAccountErrorMessage(
  error: unknown,
  errorText: (error: LocalizableError) => string,
  fallback: string,
): string {
  if (isClerkAPIResponseError(error)) {
    const first = error.errors[0];
    return first ? errorText(toLocalizableApiError(first, fallback)) : fallback;
  }
  return fallback;
}
