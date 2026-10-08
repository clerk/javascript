import { isUserLockedError } from '@clerk/shared/error';
import { clerkInvalidFAPIResponse } from '@clerk/shared/internal/clerk-js/errors';
import { useClerk } from '@clerk/shared/react';
import type { PhoneCodeFactor, SignInFactor } from '@clerk/shared/types';

import { useCoreSignIn, useSignInContext } from '../../contexts';
import { useSupportEmail } from '../../hooks/useSupportEmail';
import { useRouter } from '../../router';
import { navigateOnSignInProtectGate } from './handleProtectCheck';

export function useSignInFactorOneAlternativeChannelCodeModel(props: {
  factor: PhoneCodeFactor;
  factorAlreadyPrepared: boolean;
  onFactorPrepare: () => void;
  onChangePhoneCodeChannel: (factor: SignInFactor) => void;
}) {
  const signIn = useCoreSignIn();
  const { navigate } = useRouter();
  const { afterSignInUrl, navigateOnSetActive } = useSignInContext();
  const clerk = useClerk();
  const supportEmail = useSupportEmail();
  const channel = props.factor.channel;
  const shouldAvoidPrepare = signIn.firstFactorVerification.status === 'verified' && props.factorAlreadyPrepared;

  const prepare = async () => {
    if (shouldAvoidPrepare) {
      return;
    }
    await signIn.prepareFirstFactor({ ...props.factor, channel } as PhoneCodeFactor);
    props.onFactorPrepare();
  };

  const attempt = async (code: string, resolve: () => void | Promise<void>) => {
    try {
      const result = await signIn.attemptFirstFactor({ strategy: props.factor.strategy, code });
      await resolve();

      if (navigateOnSignInProtectGate(result, navigate, '../protect-check')) {
        return;
      }

      switch (result.status) {
        case 'complete':
          return clerk.setActive({
            session: result.createdSessionId,
            navigate: async ({ session, decorateUrl }) => {
              await navigateOnSetActive({ session, redirectUrl: afterSignInUrl, decorateUrl });
            },
          });
        case 'needs_second_factor':
          return navigate('../factor-two');
        case 'needs_new_password':
          return navigate('../reset-password');
        default:
          return console.error(clerkInvalidFAPIResponse(result.status, supportEmail));
      }
    } catch (error) {
      if (isUserLockedError(error)) {
        // @ts-expect-error -- private method for the time being
        return clerk.__internal_navigateWithError('..', error.errors[0]);
      }
      throw error;
    }
  };

  return {
    safeIdentifier: props.factor.safeIdentifier,
    profileImageUrl: signIn.userData.imageUrl,
    prepare,
    attempt,
    goBack: () => navigate('../'),
    changeToSMS: () => props.onChangePhoneCodeChannel({ ...props.factor, channel: undefined } as SignInFactor),
  };
}
