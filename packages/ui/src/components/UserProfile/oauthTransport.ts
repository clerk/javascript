import { ClerkRuntimeError } from '@clerk/shared/error';
import type { ExternalAccountResource, OAuthTransport, UserResource } from '@clerk/shared/types';

export function getExternalVerificationRedirectURL(response: ExternalAccountResource | undefined): URL {
  const url = response?.verification?.externalVerificationRedirectURL;
  if (!url) {
    throw new ClerkRuntimeError('OAuth flow did not receive a verification URL.', {
      code: 'oauth_missing_verification_url',
    });
  }

  return url;
}

export async function openOAuthTransportWithClerkErrors(
  transport: OAuthTransport,
  url: URL,
): Promise<{ callbackUrl: string }> {
  try {
    return await transport.open(url);
  } catch (cause) {
    throw new ClerkRuntimeError('The OAuth transport failed to complete the flow.', {
      code: 'something_went_wrong',
      cause: cause instanceof Error ? cause : undefined,
    });
  }
}

export async function reloadUserAfterOAuthCallback(user: UserResource, callbackUrl: string): Promise<void> {
  const nonce = new URL(callbackUrl).searchParams.get('rotating_token_nonce');

  if (nonce) {
    await user.reload({ rotatingTokenNonce: nonce });
    return;
  }

  await user.reload();
}
