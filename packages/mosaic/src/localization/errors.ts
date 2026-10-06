import type { ClerkAPIError } from '@clerk/shared/types';

import { useMessages } from './context';
import type { MessageValues } from './messages';
import { fill } from './messages';

export interface LocalizableError {
  code: string;
  paramName?: string;
  message?: string;
  /** Values for the `{placeholder}`s in whichever message the code resolves to. */
  params?: MessageValues;
}

/** A failure Clerk cannot describe, such as a code fault. Rendering it shows the fallback; `cause` is the original. */
export interface UnlocalizableError {
  cause: unknown;
}

/** What an owner holds about a failure, whether or not Clerk could describe it. */
export type ErrorDescription = LocalizableError | UnlocalizableError;

export function isLocalizableError(error: ErrorDescription): error is LocalizableError {
  return !('cause' in error);
}

export function toLocalizableApiError(error: ClerkAPIError, fallback?: string): LocalizableError {
  const message = error.longMessage || error.message;
  return {
    code: error.code,
    paramName: error.meta?.paramName,
    message: fallback === undefined ? message : message || fallback,
  };
}

/**
 * Turns an error into copy: the catalog entry for its code on that field, then for its code, then the
 * message Clerk sent, then `fallback`, then the generic error.
 */
export function useErrorText(): (error: ErrorDescription, fallback?: string) => string {
  const messages = useMessages('errors');
  const lookup = (key: string | undefined) => (key && Object.hasOwn(messages, key) ? messages[key] : undefined);
  return (error, fallback) => {
    if (!isLocalizableError(error)) {
      return fallback || messages.generic;
    }
    const { code, paramName, message, params } = error;
    const template =
      lookup(paramName ? `${code}__${paramName}` : undefined) ??
      lookup(code) ??
      (message || fallback || messages.generic);
    return params ? fill(template, params) : template;
  };
}
