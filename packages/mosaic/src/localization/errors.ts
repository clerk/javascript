import type { ClerkAPIError } from '@clerk/shared/types';

import { useMessages } from './context';
import type { MessageValues } from './messages';
import { fill } from './messages';

export interface LocalizableError {
  code?: string;
  paramName?: string;
  message?: string;
  /** Values for the `{placeholder}`s in whichever message the code resolves to. */
  params?: MessageValues;
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
export function useErrorText(): (error: LocalizableError, fallback?: string) => string {
  const messages = useMessages('errors');
  const lookup = (key: string | undefined) => (key && Object.hasOwn(messages, key) ? messages[key] : undefined);
  return ({ code, paramName, message, params }, fallback) => {
    const template =
      lookup(code && paramName ? `${code}__${paramName}` : undefined) ??
      lookup(code) ??
      (message || fallback || messages.generic);
    return params ? fill(template, params) : template;
  };
}
