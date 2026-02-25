import type { DecorateUrl, LoadedClerk, SessionResource } from '@clerk/shared/types';

import type { RouteContextValue } from '../../router/RouteContext';

type HandleSignUpIfMissingTransferProps = {
  clerk: LoadedClerk;
  navigate: RouteContextValue['navigate'];
  afterSignUpUrl: string;
  navigateOnSetActive: (opts: {
    session: SessionResource;
    redirectUrl: string;
    decorateUrl: DecorateUrl;
  }) => Promise<unknown>;
  unsafeMetadata?: SignUpUnsafeMetadata;
};

/**
 * Handles transferring from sign-in to sign-up when the backend returns
 * `firstFactorVerification.status === 'transferable'` (i.e. the user does not
 * exist and `signUpIfMissing` was used).
 */
export async function handleSignUpIfMissingTransfer({
  clerk,
  navigate,
  afterSignUpUrl,
  navigateOnSetActive,
  unsafeMetadata,
}: HandleSignUpIfMissingTransferProps): Promise<unknown> {
  const res = await clerk.client.signUp.create({
    transfer: true,
    unsafeMetadata,
  });

  switch (res.status) {
    case 'complete':
      return clerk.setActive({
        session: res.createdSessionId,
        navigate: async ({ session, decorateUrl }) => {
          await navigateOnSetActive({ session, redirectUrl: afterSignUpUrl, decorateUrl });
        },
      });
    case 'missing_requirements':
      return navigate(`../create/continue`);
    default:
      throw new Error(`Unexpected sign-up status after transfer: ${res.status}`);
  }
}
