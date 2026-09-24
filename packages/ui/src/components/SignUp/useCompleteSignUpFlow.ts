import { useClerk } from '@clerk/shared/react';
import type { SignUpResource } from '@clerk/shared/types';
import { useCallback } from 'react';

import { useSignUpContext } from '../../contexts';
import { useRouter } from '../../router';
import { completeSignUpFlow } from './util';

type CompleteSignUpFlowParams = {
  signUp: SignUpResource;
  verifyEmailPath?: string;
  verifyPhonePath?: string;
  protectCheckPath?: string;
  continuePath?: string;
  handleComplete?: () => Promise<void>;
};

export const useCompleteSignUpFlow = () => {
  const { navigate } = useRouter();
  const { setActive } = useClerk();
  const ctx = useSignUpContext();
  const { afterSignUpUrl, ssoCallbackUrl, oidcPrompt, navigateOnSetActive } = ctx;

  return useCallback(
    ({ signUp, handleComplete, ...paths }: CompleteSignUpFlowParams) =>
      completeSignUpFlow({
        ...paths,
        signUp,
        navigate,
        redirectUrl: ssoCallbackUrl,
        redirectUrlComplete: afterSignUpUrl || '/',
        oidcPrompt,
        handleComplete:
          handleComplete ??
          (() =>
            setActive({
              session: signUp.createdSessionId,
              navigate: async ({ session, decorateUrl }) => {
                await navigateOnSetActive({ session, redirectUrl: afterSignUpUrl, decorateUrl });
              },
            })),
      }),
    [navigate, setActive, afterSignUpUrl, ssoCallbackUrl, oidcPrompt, navigateOnSetActive],
  );
};
