import { isClerkAPIResponseError } from '@clerk/shared/error';

import type { LocalizableError } from '../../../localization';

export function enterpriseAccountErrorMessage(
  error: unknown,
  errorText: (error: LocalizableError) => string,
  fallback: string,
): string {
  if (isClerkAPIResponseError(error)) {
    const first = error.errors[0];
    return errorText({
      code: first?.code,
      paramName: first?.meta?.paramName,
      message: first?.longMessage || first?.message || fallback,
    });
  }
  return fallback;
}
