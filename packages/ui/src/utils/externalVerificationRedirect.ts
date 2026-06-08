import type { ExternalAccountResource, NativeOAuthHandler, UserResource } from '@clerk/shared/types';

import { throwIfNativeRedirectCallbackHasError } from './nativeRedirectCallback';

type CreateExternalAccount = (redirectUrl: string) => Promise<ExternalAccountResource | undefined>;

export async function connectExternalAccountWithTransport(opts: {
  transport: NativeOAuthHandler;
  createExternalAccount: CreateExternalAccount;
  user: UserResource;
}): Promise<void> {
  const redirectUrl = await opts.transport.getRedirectUrl();
  const externalAccount = await opts.createExternalAccount(redirectUrl);
  const verificationUrl = externalAccount?.verification?.externalVerificationRedirectURL;

  if (!verificationUrl) {
    return;
  }

  const { callbackUrl } = await opts.transport.open(verificationUrl);
  throwIfNativeRedirectCallbackHasError(callbackUrl);

  // The reloaded user surfaces any stored verification error inline on the connected-account row,
  // matching the web flow.
  await opts.user.reload();
}
