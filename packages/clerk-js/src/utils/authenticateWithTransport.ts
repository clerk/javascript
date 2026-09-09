import { ClerkRuntimeError } from '@clerk/shared/error';
import { ERROR_CODES } from '@clerk/shared/internal/clerk-js/constants';
import type {
  AuthenticateWithRedirectParams,
  HandleOAuthCallbackParams,
  OAuthTransport,
  SignInResource,
  SignUpResource,
} from '@clerk/shared/types';

type AuthenticateMethod = (
  params: AuthenticateWithRedirectParams,
  navigateCallback: (url: URL | string) => void,
) => Promise<void>;

type ClerkWithResourceCallback = {
  __internal_handleResourceCallback: (
    resource: SignInResource | SignUpResource,
    params: HandleOAuthCallbackParams,
  ) => Promise<unknown>;
};

const NATIVE_OAUTH_FAILED_STATUS = 'failed';
const NATIVE_OAUTH_ERROR_FALLBACK_CODE = 'oauth_callback_failed';
const NATIVE_OAUTH_TRANSFER_SIGNAL_CODES = new Set<string>([
  ERROR_CODES.EXTERNAL_ACCOUNT_NOT_FOUND,
  ERROR_CODES.EXTERNAL_ACCOUNT_EXISTS,
]);
const NATIVE_OAUTH_ERROR_MESSAGES: Record<string, string> = {
  [ERROR_CODES.OAUTH_ACCESS_DENIED]: 'You did not grant access to your account.',
};

function getNativeOAuthCallbackFailure(callbackUrl: string): { code: string; message: string } | null {
  const searchParams = new URL(callbackUrl).searchParams;
  const status = searchParams.get('__clerk_status');

  if (status !== NATIVE_OAUTH_FAILED_STATUS) {
    return null;
  }

  const unsafeCode = searchParams.get('__clerk_error_code') || NATIVE_OAUTH_ERROR_FALLBACK_CODE;
  if (NATIVE_OAUTH_TRANSFER_SIGNAL_CODES.has(unsafeCode)) {
    return null;
  }

  const code = NATIVE_OAUTH_ERROR_MESSAGES[unsafeCode] ? unsafeCode : NATIVE_OAUTH_ERROR_FALLBACK_CODE;

  return {
    code,
    message: NATIVE_OAUTH_ERROR_MESSAGES[code] || 'OAuth callback failed.',
  };
}

async function resetFailedAttempt(resource: SignInResource | SignUpResource): Promise<void> {
  try {
    // Both resources accept `{}` to reset the attempt, but their `create` param types differ.
    await (resource.create as (params: Record<string, never>) => Promise<unknown>)({});
  } catch {
    // Best-effort: the OAuth failure is still thrown, so a failed reset just keeps the prior behavior.
  }
}

export async function getOAuthTransportRedirectUrl(transport: OAuthTransport): Promise<string> {
  const url = new URL(String(await transport.getRedirectUrl()));
  if (['javascript:', 'data:', 'file:', 'about:'].includes(url.protocol)) {
    throw new ClerkRuntimeError('OAuth transport callback URL is not supported.', {
      code: 'oauth_transport_invalid_callback_url',
    });
  }
  return url.toString();
}

export async function openAndReconcileOAuthTransport(opts: {
  transport: OAuthTransport;
  resource: SignInResource | SignUpResource;
  verificationUrl: URL | string;
  redirectUrl: string;
  onCallbackFailure?: () => Promise<void>;
}): Promise<void> {
  const { callbackUrl } = await opts.transport.open(new URL(opts.verificationUrl.toString()));
  const callback = new URL(callbackUrl);
  const expected = new URL(opts.redirectUrl);
  if (
    callback.protocol !== expected.protocol ||
    callback.host !== expected.host ||
    callback.pathname !== expected.pathname ||
    callback.username !== expected.username ||
    callback.password !== expected.password ||
    Array.from(expected.searchParams).some(([key, value]) => callback.searchParams.get(key) !== value)
  ) {
    throw new ClerkRuntimeError('OAuth transport received an unexpected callback URL.', {
      code: 'oauth_transport_callback_mismatch',
    });
  }

  const failure = getNativeOAuthCallbackFailure(callbackUrl);
  if (failure && opts.onCallbackFailure) {
    await opts.onCallbackFailure();
  } else {
    const nonce = callback.searchParams.get('rotating_token_nonce');
    if (nonce) await opts.resource.reload({ rotatingTokenNonce: nonce });
    else await opts.resource.reload();
  }
  if (failure) throw new ClerkRuntimeError(failure.message, { code: failure.code });
}

export async function _authenticateWithTransport(opts: {
  clerk: ClerkWithResourceCallback;
  transport: OAuthTransport;
  resource: SignInResource | SignUpResource;
  authenticateMethod: AuthenticateMethod;
  params: AuthenticateWithRedirectParams;
  callbackParams: HandleOAuthCallbackParams;
}): Promise<void> {
  const redirectUrl = await getOAuthTransportRedirectUrl(opts.transport);

  let verificationUrl: URL | string | undefined;
  // Production FAPI validates both URLs against the redirect allowlist and only the transport
  // callback is guaranteed registered; the app's destination is navigated client-side instead.
  await opts.authenticateMethod({ ...opts.params, redirectUrl, redirectUrlComplete: redirectUrl }, url => {
    verificationUrl = url;
  });

  if (!verificationUrl) {
    throw new ClerkRuntimeError('OAuth transport did not receive a verification URL.', {
      code: 'oauth_transport_missing_verification_url',
    });
  }

  await openAndReconcileOAuthTransport({
    transport: opts.transport,
    resource: opts.resource,
    verificationUrl,
    redirectUrl,
    onCallbackFailure: () => resetFailedAttempt(opts.resource),
  });

  await opts.clerk.__internal_handleResourceCallback(opts.resource, opts.callbackParams);
}
