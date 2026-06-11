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

/**
 * Drives an OAuth/SSO flow through a registered OAuth transport while reusing the
 * resource's redirect/popup orchestration unchanged.
 *
 * @internal
 */
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
  await opts.authenticateMethod({ ...opts.params, redirectUrl, redirectUrlComplete: redirectUrl }, url => {
    verificationUrl = url;
  });

  if (!verificationUrl) {
    throw new ClerkRuntimeError('OAuth transport did not receive a verification URL.', {
      code: 'oauth_transport_missing_verification_url',
    });
  }

  const { callbackUrl } = await opts.transport.open(new URL(verificationUrl.toString()));
  const nonce = new URL(callbackUrl).searchParams.get('rotating_token_nonce');

  if (nonce) {
    await opts.resource.reload({ rotatingTokenNonce: nonce });
  }

  await opts.clerk.__internal_handleResourceCallback(opts.resource, opts.callbackParams);
}
