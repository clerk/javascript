import { ClerkAPIResponseError } from '@clerk/shared/error';
import type { ClerkAPIError } from '@clerk/shared/types';

const ERROR_CODE_PARAM_NAMES = ['clerk_error_code', 'error_code', 'code', 'error'] as const;
const ERROR_MESSAGE_PARAM_NAMES = ['clerk_error_message', 'error_message', 'message', 'error_description'] as const;
const ERROR_LONG_MESSAGE_PARAM_NAMES = ['clerk_error_long_message', 'long_message', 'longMessage'] as const;
const ERROR_STATUS_PARAM_NAMES = ['clerk_error_status', 'error_status', 'status'] as const;

function getFirstParam(searchParams: URLSearchParams, names: readonly string[]): string | null {
  for (const name of names) {
    const value = searchParams.get(name);
    if (value) {
      return value;
    }
  }

  return null;
}

function getErrorStatus(searchParams: URLSearchParams): number {
  const status = getFirstParam(searchParams, ERROR_STATUS_PARAM_NAMES);
  if (!status) {
    return 400;
  }

  const parsedStatus = Number(status);
  return Number.isInteger(parsedStatus) ? parsedStatus : 400;
}

export function throwIfNativeRedirectCallbackHasError(callbackUrl: string): void {
  const url = new URL(callbackUrl);
  const code = getFirstParam(url.searchParams, ERROR_CODE_PARAM_NAMES);

  if (!code) {
    return;
  }

  const message = getFirstParam(url.searchParams, ERROR_MESSAGE_PARAM_NAMES) || code;
  const longMessage = getFirstParam(url.searchParams, ERROR_LONG_MESSAGE_PARAM_NAMES) || undefined;

  throw new ClerkAPIResponseError(longMessage || message, {
    status: getErrorStatus(url.searchParams),
    data: [
      {
        code,
        message,
        long_message: longMessage,
      },
    ],
  });
}

/**
 * Native OAuth callbacks can return to the app without a rotating token nonce when the
 * provider stores an error on the pending sign-in/sign-up resource. Surface that resource
 * error through the same API response error path used by regular resource requests.
 */
export function createNativeRedirectResourceError(error: ClerkAPIError): ClerkAPIResponseError {
  return new ClerkAPIResponseError(error.longMessage || error.message, {
    status: 400,
    data: [
      {
        code: error.code,
        message: error.message,
        long_message: error.longMessage,
        meta: {
          param_name: error.meta?.paramName,
          session_id: error.meta?.sessionId,
          email_addresses: error.meta?.emailAddresses,
          identifiers: error.meta?.identifiers,
          zxcvbn: error.meta?.zxcvbn,
          plan: error.meta?.plan,
          is_plan_upgrade_possible: error.meta?.isPlanUpgradePossible,
        },
      },
    ],
  });
}

export function throwIfNativeRedirectResourceHasError(error: ClerkAPIError | null | undefined): void {
  if (!error) {
    return;
  }

  throw createNativeRedirectResourceError(error);
}

export function getRotatingTokenNonceFromNativeRedirectCallback(callbackUrl: string): string | null {
  return new URL(callbackUrl).searchParams.get('rotating_token_nonce');
}
