import { isClerkAPIResponseError, isUserLockedError } from '@clerk/shared/error';
import { clerkInvalidFAPIResponse } from '@clerk/shared/internal/clerk-js/errors';
import { useClerk } from '@clerk/shared/react';
import type { SignInResource } from '@clerk/shared/types';
import { useMemo } from 'react';

import { useAuthCodeRequestScopeModel } from '@/ui/common/auth-code-request-scope.model';

import { useCoreSignIn, useEnvironment, useSignInContext } from '../../contexts';
import { useSupportEmail } from '../../hooks/useSupportEmail';
import { useRouter } from '../../router';
import { navigateOnSignInProtectGate } from './handleProtectCheck';
import type { SignInFactorTwoCodeData } from './sign-in-code-form.types';
import type { SignInFactorTwoCodeFormProps } from './SignInFactorTwoCodeForm';
import { isResetPasswordStrategy } from './utils';

const isResettingPassword = (resource: SignInResource) =>
  isResetPasswordStrategy(resource.firstFactorVerification?.strategy) &&
  resource.firstFactorVerification?.status === 'verified';

export const useSignInFactorTwoCodeFormModel = (props: SignInFactorTwoCodeFormProps): SignInFactorTwoCodeData => {
  const env = useEnvironment();
  const signIn = useCoreSignIn();
  const { afterSignInUrl, navigateOnSetActive } = useSignInContext();
  const { setActive } = useClerk();
  const { navigate } = useRouter();
  const supportEmail = useSupportEmail();
  const clerk = useClerk();
  const scope = useAuthCodeRequestScopeModel(
    'signIn',
    signIn,
    JSON.stringify([
      'second',
      props.factor.strategy,
      'phoneNumberId' in props.factor
        ? props.factor.phoneNumberId
        : 'emailAddressId' in props.factor
          ? props.factor.emailAddressId
          : null,
    ]),
  );

  // Only show the new device verification notice if the user is new
  // and no attributes are explicitly used for second factor.
  // Retained for backwards compatibility.
  const showNewDeviceVerificationNotice = useMemo(() => {
    const anyAttributeUsedForSecondFactor = Object.values(env.userSettings.attributes).some(
      attr => attr.used_for_second_factor,
    );
    return signIn.clientTrustState === 'new' && !anyAttributeUsedForSecondFactor;
  }, [signIn.clientTrustState, env.userSettings.attributes]);

  return {
    requestKey: scope.requestKey,
    canRun: scope.canRun,
    showNewDeviceVerificationNotice,
    resettingPassword: isResettingPassword(signIn),
    safeIdentifier: 'safeIdentifier' in props.factor ? props.factor.safeIdentifier : undefined,
    profileImageUrl: signIn.userData.imageUrl,
    prepareFactor: props.prepare
      ? async () => {
          await scope.run(async () => {
            await props.prepare?.();
          });
        }
      : undefined,
    attempt: async code => {
      const resource = await scope.run(() => signIn.attemptSecondFactor({ strategy: props.factor.strategy, code }));
      return async () => {
        if (!resource) {
          return;
        }
        await scope.run(async () => {
          if (navigateOnSignInProtectGate(resource, navigate, '../protect-check')) {
            return;
          }
          if (resource.status !== 'complete') {
            console.error(clerkInvalidFAPIResponse(resource.status, supportEmail));
            return;
          }
          if (isResettingPassword(resource) && resource.createdSessionId) {
            const queryParams = new URLSearchParams();
            queryParams.set('createdSessionId', resource.createdSessionId);
            await navigate(`../reset-password-success?${queryParams.toString()}`);
            return;
          }
          await setActive({
            session: resource.createdSessionId,
            navigate: async ({ session, decorateUrl }) => {
              await navigateOnSetActive({ session, redirectUrl: afterSignInUrl, decorateUrl });
            },
          });
        });
      };
    },
    getErrorRecovery: error =>
      scope.canRun() && isClerkAPIResponseError(error) && isUserLockedError(error)
        ? {
            resolveCode: false,
            complete: async () => {
              // @ts-expect-error -- private method for the time being
              await scope.run(() => clerk.__internal_navigateWithError('..', error.errors[0]));
            },
          }
        : undefined,
    signInAsDifferentUser: () => navigate('../'),
  };
};
