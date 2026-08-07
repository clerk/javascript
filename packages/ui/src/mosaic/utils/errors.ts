import { isClerkAPIResponseError } from '@clerk/shared/error';
import type { ClerkAPIError } from '@clerk/shared/types';

/**
 * Pure Clerk API error parsing for the Mosaic layer. These mirror the field/global split of the
 * legacy `@/utils/errorHandler`, but carry none of its styled-system form coupling (the legacy
 * module's `handleError`/`setFieldErrors` pull in `useFormControl`), so a Mosaic controller can
 * normalize a mutation rejection to a plain `Error` without reaching into the legacy `@/` tree.
 */

interface ParsedErrors {
  fieldErrors: ClerkAPIError[];
  globalErrors: ClerkAPIError[];
}

function parseErrors(errors: ClerkAPIError[]): ParsedErrors {
  return (errors || []).reduce<ParsedErrors>(
    (memo, err) => {
      if (err.meta?.paramName) {
        memo.fieldErrors.push(err);
      } else {
        memo.globalErrors.push(err);
      }
      return memo;
    },
    { fieldErrors: [], globalErrors: [] },
  );
}

/** The first global (non-field) Clerk API error, or undefined if the error is not one / has none. */
export function getGlobalError(err: Error): ClerkAPIError | undefined {
  if (!isClerkAPIResponseError(err)) {
    return;
  }
  return parseErrors(err.errors).globalErrors[0];
}

/** The first field-scoped Clerk API error, or undefined if the error is not one / has none. */
export function getFieldError(err: Error): ClerkAPIError | undefined {
  if (!isClerkAPIResponseError(err)) {
    return;
  }
  return parseErrors(err.errors).fieldErrors[0];
}

/** The user-facing message for a Clerk API error, preferring the long form. */
export function getClerkAPIErrorMessage(err: ClerkAPIError): string {
  return err.longMessage || err.message;
}
