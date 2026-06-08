import { ClerkAPIResponseError, ClerkRuntimeError } from '@clerk/shared/error';
import type { ClerkElectronBridge } from '@clerk/shared/types';

type CallbackResult = { url: string } | { error: unknown };

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

export function waitForNativeRedirectCallback(bridge: ClerkElectronBridge): Promise<CallbackResult> {
  return Promise.resolve(bridge.waitForRedirectCallback()).then(
    url => ({ url }),
    error => ({ error }),
  );
}

/**
 * Opens the external verification URL through the native bridge and resolves with the callback URL
 * the OS routes back to the app. Returns `null` when there is no external verification step.
 *
 * A rejected `waitForRedirectCallback` (e.g. the user closed the browser window or the bridge timed
 * out) is the only true cancellation, and its error is rethrown here so callers can treat it as such.
 */
export async function openExternalAndWaitForCallback(
  bridge: ClerkElectronBridge,
  externalVerificationRedirectURL: URL | null | undefined,
): Promise<string | null> {
  if (!externalVerificationRedirectURL) {
    return null;
  }

  const callbackPromise = waitForNativeRedirectCallback(bridge);

  await bridge.openExternal(externalVerificationRedirectURL.toString());

  const callbackResult = await callbackPromise;
  if ('error' in callbackResult) {
    throw callbackResult.error;
  }

  return callbackResult.url;
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
 * Thrown when the native browser flow is abandoned (the window was closed or the bridge timed out)
 * before any callback was received. This is intentionally swallowed by the UI error handler.
 */
export function createNativeRedirectCancelledError(): ClerkRuntimeError {
  return new ClerkRuntimeError('Native redirect verification was cancelled or did not complete.', {
    code: 'native_redirect_cancelled',
  });
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
