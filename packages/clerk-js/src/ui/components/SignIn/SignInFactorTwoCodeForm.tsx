import { isUserLockedError } from '@clerk/shared/error';
import { useClerk } from '@clerk/shared/react';
import type { PhoneCodeFactor, SignInResource, TOTPFactor } from '@clerk/types';
import React from 'react';

import { clerkInvalidFAPIResponse } from '../../../core/errors';
import { useCoreSignIn, useSignInContext } from '../../contexts';
import { localizationKeys, Text } from '../../customizables';
import type { VerificationCodeCardProps } from '../../elements';
import { useCardState, VerificationCodeCard } from '../../elements';
import { useSupportEmail } from '../../hooks/useSupportEmail';
import type { LocalizationKey } from '../../localization';
import { useRouter } from '../../router';
import { handleError } from '../../utils';
import { isResetPasswordStrategy } from './utils';

export type SignInFactorTwoCodeCard = Pick<VerificationCodeCardProps, 'onShowAlternativeMethodsClicked'> & {
  factor: PhoneCodeFactor | TOTPFactor;
  factorAlreadyPrepared: boolean;
  onFactorPrepare: () => void;
  prepare?: () => Promise<SignInResource>;
};

type SignInFactorTwoCodeFormProps = SignInFactorTwoCodeCard & {
  cardTitle: LocalizationKey;
  cardSubtitle: LocalizationKey;
  inputLabel: LocalizationKey;
  resendButton?: LocalizationKey;
};

export const SignInFactorTwoCodeForm = (props: SignInFactorTwoCodeFormProps) => {
  const signIn = useCoreSignIn();
  const card = useCardState();
  const { afterSignInUrl } = useSignInContext();
  const { setActive } = useClerk();
  const { navigate } = useRouter();
  const supportEmail = useSupportEmail();
  const clerk = useClerk();

  React.useEffect(() => {
    if (props.factorAlreadyPrepared) {
      return;
    }

    void prepare?.();
  }, []);

  const prepare = props.prepare
    ? () => {
        return props
          .prepare?.()
          .then(() => props.onFactorPrepare())
          .catch(err => {
            if (isUserLockedError(err)) {
              // @ts-expect-error -- private method for the time being
              return clerk.__internal_navigateWithError('..', err.errors[0]);
            }

            handleError(err, [], card.setError);
          });
      }
    : undefined;

  const isResettingPassword = (resource: SignInResource) =>
    isResetPasswordStrategy(resource.firstFactorVerification?.strategy) &&
    resource.firstFactorVerification?.status === 'verified';

  const action: VerificationCodeCardProps['onCodeEntryFinishedAction'] = (code, resolve, reject) => {
    signIn
      .attemptSecondFactor({ strategy: props.factor.strategy, code })
      .then(async res => {
        await resolve();
        switch (res.status) {
          case 'complete':
            if (isResettingPassword(res) && res.createdSessionId) {
              const queryParams = new URLSearchParams();
              queryParams.set('createdSessionId', res.createdSessionId);
              return navigate(`../reset-password-success?${queryParams.toString()}`);
            }
            // Nowadays, the `redirectUrl` is bypassed if the session provided is pending
            // #handlePendingSession is earlier executed within `setActive` which navigates to the tasks flow
            return setActive({ session: res.createdSessionId, redirectUrl: afterSignInUrl });
          default:
            return console.error(clerkInvalidFAPIResponse(res.status, supportEmail));
        }
      })
      .catch(err => {
        if (isUserLockedError(err)) {
          // @ts-expect-error -- private method for the time being
          return clerk.__internal_navigateWithError('..', err.errors[0]);
        }

        return reject(err);
      });
  };

  return (
    <VerificationCodeCard
      cardTitle={props.cardTitle}
      cardSubtitle={
        isResettingPassword(signIn) ? localizationKeys('signIn.forgotPassword.subtitle') : props.cardSubtitle
      }
      resendButton={props.resendButton}
      inputLabel={props.inputLabel}
      onCodeEntryFinishedAction={action}
      onResendCodeClicked={prepare}
      safeIdentifier={'safeIdentifier' in props.factor ? props.factor.safeIdentifier : undefined}
      profileImageUrl={signIn.userData.imageUrl}
      onShowAlternativeMethodsClicked={props.onShowAlternativeMethodsClicked}
    >
      {isResettingPassword(signIn) && (
        <Text
          localizationKey={localizationKeys('signIn.resetPasswordMfa.detailsLabel')}
          colorScheme='secondary'
        />
      )}
    </VerificationCodeCard>
  );
};
