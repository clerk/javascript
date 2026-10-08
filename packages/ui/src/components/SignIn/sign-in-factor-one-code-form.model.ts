import { isClerkAPIResponseError, isUserLockedError } from '@clerk/shared/error';
import { clerkInvalidFAPIResponse } from '@clerk/shared/internal/clerk-js/errors';
import { useClerk } from '@clerk/shared/react';
import type { SignInResource } from '@clerk/shared/types';

import { useAuthCodeRequestScopeModel } from '@/ui/common/auth-code-request-scope.model';

import { useCoreSignIn, useSignInContext } from '../../contexts';
import { useSupportEmail } from '../../hooks/useSupportEmail';
import { useRouter } from '../../router';
import { navigateOnSignInProtectGate } from './handleProtectCheck';
import { handleSignUpIfMissingTransfer } from './handleSignUpIfMissingTransfer';
import type { SignInFactorOneCodeData } from './sign-in-code-form.types';
import type { SignInFactorOneCodeFormProps } from './SignInFactorOneCodeForm';

export const useSignInFactorOneCodeFormModel = (props: SignInFactorOneCodeFormProps): SignInFactorOneCodeData => {
  const signIn = useCoreSignIn();
  const { navigate } = useRouter();
  const ctx = useSignInContext();
  const { afterSignInUrl, afterSignUpUrl, signUpIfMissingEnabled, navigateOnSetActive } = ctx;
  const { setActive } = useClerk();
  const supportEmail = useSupportEmail();
  const clerk = useClerk();

  const factorChannel = 'channel' in props.factor ? props.factor.channel : undefined;
  const normalizedFactorChannel = factorChannel === 'sms' ? undefined : factorChannel;
  const normalizedVerificationChannel =
    signIn.firstFactorVerification.channel === 'sms' ? undefined : signIn.firstFactorVerification.channel;
  const hasPendingFactorVerification =
    signIn.firstFactorVerification.status === 'unverified' &&
    signIn.firstFactorVerification.strategy === props.factor.strategy &&
    normalizedFactorChannel === normalizedVerificationChannel;
  const shouldAvoidPrepare = signIn.firstFactorVerification.status === 'verified' && props.factorAlreadyPrepared;
  const shouldAvoidInitialPrepare = shouldAvoidPrepare || hasPendingFactorVerification;

  const strategy = props.factor.strategy;
  const emailAddressId = 'emailAddressId' in props.factor ? props.factor.emailAddressId : undefined;
  const phoneNumberId = 'phoneNumberId' in props.factor ? props.factor.phoneNumberId : undefined;
  const scope = useAuthCodeRequestScopeModel(
    'signIn',
    signIn,
    JSON.stringify([strategy, emailAddressId, phoneNumberId, factorChannel]),
  );

  // A `prepare` (the code-send itself, on mount and on resend) can come back Protect-gated, not
  // just `attempt` below. Route it through the same choke point so the gate isn't dropped — a
  // no-op when the response isn't gated.
  const handlePrepareResult = (resource: SignInResource) => {
    if (navigateOnSignInProtectGate(resource, navigate, '../protect-check')) {
      return;
    }
    props.onFactorPrepare();
  };

  const navigateWithError = async (error: unknown) => {
    // @ts-expect-error -- private method for the time being
    await clerk.__internal_navigateWithError('..', error);
  };

  return {
    requestKey: scope.requestKey,
    canRun: scope.canRun,
    shouldAvoidPrepare,
    shouldAvoidInitialPrepare,
    prepareRequest: async () => {
      const response = await scope.run(() => signIn.prepareFirstFactor(props.factor));
      if (response && scope.canRun()) {
        handlePrepareResult(response);
      }
    },
    attempt: async code => {
      const resource = await scope.run(() => signIn.attemptFirstFactor({ strategy: props.factor.strategy, code }));
      return async () => {
        if (!resource) {
          return;
        }
        await scope.run(async () => {
          if (navigateOnSignInProtectGate(resource, navigate, '../protect-check')) {
            return;
          }
          switch (resource.status) {
            case 'complete':
              await setActive({
                session: resource.createdSessionId,
                navigate: async ({ session, decorateUrl }) => {
                  await navigateOnSetActive({ session, redirectUrl: afterSignInUrl, decorateUrl });
                },
              });
              break;
            case 'needs_second_factor':
              await navigate('../factor-two');
              break;
            case 'needs_new_password':
              await navigate('../reset-password');
              break;
            default:
              console.error(clerkInvalidFAPIResponse(resource.status, supportEmail));
          }
        });
      };
    },
    getErrorRecovery: error => {
      if (!scope.canRun()) {
        return undefined;
      }
      if (isClerkAPIResponseError(error) && isUserLockedError(error)) {
        return {
          resolveCode: false,
          complete: async () => {
            await scope.run(() => navigateWithError(error.errors[0]));
          },
        };
      }
      if (signUpIfMissingEnabled && signIn.firstFactorVerification.status === 'transferable') {
        return {
          resolveCode: true,
          complete: async () => {
            await scope.run(() =>
              handleSignUpIfMissingTransfer({
                clerk,
                navigate,
                afterSignUpUrl,
                navigateOnSetActive,
                unsafeMetadata: ctx.unsafeMetadata,
              }),
            );
          },
        };
      }
      return undefined;
    },
    goBack: () => navigate('../'),
    safeIdentifier: props.factor.safeIdentifier,
    profileImageUrl: signIn.userData.imageUrl,
  };
};
