import { ClerkRuntimeError } from '@clerk/shared/error';
import type { ExternalAccountResource, UserResource } from '@clerk/shared/types';

export function getExternalVerificationRedirectURL(response: ExternalAccountResource | undefined): URL {
  const url = response?.verification?.externalVerificationRedirectURL;
  if (!url) {
    throw new ClerkRuntimeError('OAuth flow did not receive a verification URL.', {
      code: 'oauth_missing_verification_url',
    });
  }

  return url;
}

export async function reloadUserAfterOAuthCallback(user: UserResource, callbackUrl: string): Promise<void> {
  const nonce = new URL(callbackUrl).searchParams.get('rotating_token_nonce');

  if (nonce) {
    await user.reload({ rotatingTokenNonce: nonce });
    return;
  }

  await user.reload();
}
