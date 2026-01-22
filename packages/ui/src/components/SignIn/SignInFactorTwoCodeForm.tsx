import { isUserLockedError } from '@clerk/shared/error';
import { clerkInvalidFAPIResponse } from '@clerk/shared/internal/clerk-js/errors';
import { useClerk } from '@clerk/shared/react';
import type { EmailCodeFactor, PhoneCodeFactor, SignInResource, TOTPFactor } from '@clerk/shared/types';
import React, { useMemo } from 'react';

import { useCardState } from '@/ui/elements/contexts';
import type { VerificationCodeCardProps } from '@/ui/elements/VerificationCodeCard';
import { VerificationCodeCard } from '@/ui/elements/VerificationCodeCard';
import { handleError } from '@/ui/utils/errorHandler';

import { useCoreSignIn, useEnvironment, useSignInContext } from '../../contexts';
import { localizationKeys, Text } from '../../customizables';
import { useSupportEmail } from '../../hooks/useSupportEmail';
import type { LocalizationKey } from '../../localization';
import { useRouter } from '../../router';
import { isResetPasswordStrategy } from './utils';

export type SignInFactorTwoCodeCard = Pick<VerificationCodeCardProps, 'onShowAlternativeMethodsClicked'> & {
  showClientTrustNotice?: boolean;
  factor: EmailCodeFactor | PhoneCodeFactor | TOTPFactor;
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

const isResettingPassword = (resource: SignInResource) =>
  isResetPasswordStrategy(resource.firstFactorVerification?.strategy) &&
  resource.firstFactorVerification?.status === 'verified';

export const SignInFactorTwoCodeForm = (props: SignInFactorTwoCodeFormProps) => {
  const env = useEnvironment();
  const signIn = useCoreSignIn();
  const card = useCardState();
  const { afterSignInUrl, navigateOnSetActive } = useSignInContext();
  const { setSelected } = useClerk();
  const { navigate } = useRouter();
  const supportEmail = useSupportEmail();
  const clerk = useClerk();

  // Only show the new device verification notice if the user is new
  // and no attributes are explicitly used for second factor.
  // Retained for backwards compatibility.
  const showNewDeviceVerificationNotice = useMemo(() => {
    const anyAttributeUsedForSecondFactor = Object.values(env.userSettings.attributes).some(
      attr => attr.used_for_second_factor,
    );
    return signIn.clientTrustState === 'new' && !anyAttributeUsedForSecondFactor;
  }, [signIn.clientTrustState, env.userSettings.attributes]);

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
            return setSelected({
              session: res.createdSessionId,
              navigate: async ({ session }) => {
                await navigateOnSetActive({ session, redirectUrl: afterSignInUrl });
              },
            });
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
      cardNotice={
        props.showClientTrustNotice || showNewDeviceVerificationNotice
          ? localizationKeys('signIn.newDeviceVerificationNotice')
          : undefined
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
