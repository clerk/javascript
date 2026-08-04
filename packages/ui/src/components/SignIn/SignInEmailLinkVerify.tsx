import { useClerk } from '@clerk/shared/react';

import { SignInEmailLinkFlowComplete } from '../../common/EmailLinkCompleteFlowCard';
import { useSignInContext } from '../../contexts';
import { useRouter } from '../../router';
import { handleSignUpIfMissingTransfer } from './handleSignUpIfMissingTransfer';

/**
 * The SignIn tree's email-link verify route: the tab the verification link opened in.
 *
 * Mounted directly under the SignIn root, so the `../create/...` paths
 * `handleSignUpIfMissingTransfer` navigates to resolve as they do from `factor-one`.
 */
export const SignInEmailLinkVerify = () => {
  const clerk = useClerk();
  const { navigate } = useRouter();
  const { afterSignInUrl, afterSignUpUrl, signUpIfMissingEnabled, navigateOnSetActive, unsafeMetadata } =
    useSignInContext();

  const onTransferable = async () => {
    // Mirrors `verifiedFromTheSameClient` on the polling card: whichever tab shares the client
    // with the sign-in carries the flow forward. Only that client holds the banked account
    // transfer, so a link opened on another device has nothing to consume here.
    if (!signUpIfMissingEnabled || clerk.client.signIn.firstFactorVerification.status !== 'transferable') {
      return false;
    }

    await handleSignUpIfMissingTransfer({
      clerk,
      navigate,
      afterSignUpUrl,
      navigateOnSetActive,
      unsafeMetadata,
    });
    return true;
  };

  return (
    <SignInEmailLinkFlowComplete
      redirectUrlComplete={afterSignInUrl}
      redirectUrl='../factor-two'
      onTransferable={onTransferable}
    />
  );
};
