import { ClerkRuntimeError } from '@clerk/shared/error';
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
const NATIVE_OAUTH_ERROR_MESSAGES: Record<string, string> = {
  oauth_access_denied: 'You did not grant access to your account.',
};

function getNativeOAuthCallbackFailure(callbackUrl: string): { code: string; message: string } | null {
  const searchParams = new URL(callbackUrl).searchParams;
  const status = searchParams.get('__clerk_status');

  if (status !== NATIVE_OAUTH_FAILED_STATUS) {
    return null;
  }

  const unsafeCode = searchParams.get('__clerk_error_code') || NATIVE_OAUTH_ERROR_FALLBACK_CODE;
  const code = NATIVE_OAUTH_ERROR_MESSAGES[unsafeCode] ? unsafeCode : NATIVE_OAUTH_ERROR_FALLBACK_CODE;

  return {
    code,
    message: NATIVE_OAUTH_ERROR_MESSAGES[code] || 'OAuth callback failed.',
  };
}

export async function _authenticateWithTransport(opts: {
  clerk: ClerkWithResourceCallback;
  transport: OAuthTransport;
  resource: SignInResource | SignUpResource;
  authenticateMethod: AuthenticateMethod;
  params: AuthenticateWithRedirectParams;
  callbackParams: HandleOAuthCallbackParams;
}): Promise<void> {
  const redirectUrl = String(await opts.transport.getRedirectUrl());

  let verificationUrl: URL | string | undefined;
  await opts.authenticateMethod({ ...opts.params, redirectUrl }, url => {
    verificationUrl = url;
  });

  if (!verificationUrl) {
    throw new ClerkRuntimeError('OAuth transport did not receive a verification URL.', {
      code: 'oauth_transport_missing_verification_url',
    });
  }

  const { callbackUrl } = await opts.transport.open(new URL(verificationUrl.toString()));
  const failure = getNativeOAuthCallbackFailure(callbackUrl);

  if (failure) {
    throw new ClerkRuntimeError(failure.message, { code: failure.code });
  }

  const nonce = new URL(callbackUrl).searchParams.get('rotating_token_nonce');

  if (nonce) {
    await opts.resource.reload({ rotatingTokenNonce: nonce });
  } else {
    await opts.resource.reload();
  }

  await opts.clerk.__internal_handleResourceCallback(opts.resource, opts.callbackParams);
}
