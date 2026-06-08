import { ClerkAPIResponseError, ClerkRuntimeError } from '@clerk/shared/error';

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

export function getRotatingTokenNonceFromNativeRedirectCallback(callbackUrl: string): string | null {
  return new URL(callbackUrl).searchParams.get('rotating_token_nonce');
}

/**
 * Thrown when a callback was received but the verification neither succeeded nor reported an error
 * (an unexpected state). Unlike a cancellation, this is surfaced to the user so the flow never ends
 * silently.
 */
export function createNativeRedirectIncompleteError(): ClerkRuntimeError {
  return new ClerkRuntimeError('Unable to complete authentication. Please try again.', {
    code: 'native_redirect_incomplete',
  });
}
