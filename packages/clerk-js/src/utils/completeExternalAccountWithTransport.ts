import { ClerkRuntimeError } from '@clerk/shared/error';
import type { ExternalAccountResource } from '@clerk/shared/types';

import type { Clerk } from '../core/clerk';
import { openAndReconcileOAuthTransport } from './authenticateWithTransport';

export async function completeExternalAccountWithTransport(
  clerk: Clerk,
  account: ExternalAccountResource,
  userId: string,
  redirectUrl?: string,
): Promise<ExternalAccountResource> {
  const transport = clerk.__internal_oauthTransport;
  const client = clerk.client;
  const sessionId = clerk.session?.id;
  const isCurrent = () =>
    clerk.user?.id === userId && clerk.client?.id === client?.id && clerk.session?.id === sessionId;
  if (!client || !isCurrent()) {
    throw new ClerkRuntimeError('The current user changed.', { code: 'oauth_transport_stale_attempt' });
  }
  if (redirectUrl && transport) {
    const verificationUrl = account.verification?.externalVerificationRedirectURL;
    if (!verificationUrl) {
      throw new ClerkRuntimeError('The external account has no authorization URL.', {
        code: 'external_account_missing_redirect',
      });
    }
    await openAndReconcileOAuthTransport({ transport, resource: client, verificationUrl, redirectUrl, isCurrent });
  } else {
    await client.reload();
  }
  if (!isCurrent()) {
    throw new ClerkRuntimeError('The current user changed.', { code: 'oauth_transport_stale_attempt' });
  }
  clerk.updateClient(client);
  if (!isCurrent()) {
    throw new ClerkRuntimeError('The current user changed.', { code: 'oauth_transport_stale_attempt' });
  }
  const connected = clerk.user?.externalAccounts.find(candidate => candidate.id === account.id);
  if (!connected) {
    throw new ClerkRuntimeError('The external account was not found after authorization.', {
      code: 'external_account_not_found',
    });
  }
  return connected;
}
