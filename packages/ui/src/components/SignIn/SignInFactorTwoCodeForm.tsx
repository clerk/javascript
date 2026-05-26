import type { EmailCodeFactor, PhoneCodeFactor, SignInResource, TOTPFactor } from '@clerk/shared/types';
import React from 'react';

import { useCardState } from '@/ui/elements/contexts';
import type { VerificationCodeCardProps } from '@/ui/elements/VerificationCodeCard';
import { VerificationCodeCard } from '@/ui/elements/VerificationCodeCard';
import { handleError } from '@/ui/utils/errorHandler';

import { localizationKeys, Text } from '../../customizables';
import type { LocalizationKey } from '../../localization';

export type SignInFactorTwoCodeCard = Pick<VerificationCodeCardProps, 'onShowAlternativeMethodsClicked'> & {
  showClientTrustNotice?: boolean;
  factor: EmailCodeFactor | PhoneCodeFactor | TOTPFactor;
  factorAlreadyPrepared: boolean;
  onFactorPrepare: () => void;
  prepare?: () => Promise<SignInResource>;
  onAttemptCode: VerificationCodeCardProps['onCodeEntryFinishedAction'];
  avatarUrl: string | undefined;
  isResettingPassword: boolean;
  showNewDeviceVerificationNotice: boolean;
};

type SignInFactorTwoCodeFormProps = SignInFactorTwoCodeCard & {
  cardTitle: LocalizationKey;
  cardSubtitle: LocalizationKey;
  inputLabel: LocalizationKey;
  resendButton?: LocalizationKey;
};

export const SignInFactorTwoCodeForm = (props: SignInFactorTwoCodeFormProps) => {
  const card = useCardState();

  React.useEffect(() => {
    if (props.factorAlreadyPrepared) {
      return;
    }

    void prepareWrapped?.();
  }, []);

  const prepareWrapped = props.prepare
    ? () => {
        return props
          .prepare?.()
          .then(() => props.onFactorPrepare())
          .catch(err => handleError(err, [], card.setError));
      }
    : undefined;

  return (
    <VerificationCodeCard
      cardTitle={props.cardTitle}
      cardSubtitle={props.isResettingPassword ? localizationKeys('signIn.forgotPassword.subtitle') : props.cardSubtitle}
      cardNotice={
        props.showClientTrustNotice || props.showNewDeviceVerificationNotice
          ? localizationKeys('signIn.newDeviceVerificationNotice')
          : undefined
      }
      resendButton={props.resendButton}
      inputLabel={props.inputLabel}
      onCodeEntryFinishedAction={props.onAttemptCode}
      onResendCodeClicked={prepareWrapped}
      safeIdentifier={'safeIdentifier' in props.factor ? props.factor.safeIdentifier : undefined}
      profileImageUrl={props.avatarUrl}
      onShowAlternativeMethodsClicked={props.onShowAlternativeMethodsClicked}
    >
      {props.isResettingPassword && (
        <Text
          localizationKey={localizationKeys('signIn.resetPasswordMfa.detailsLabel')}
          colorScheme='secondary'
        />
      )}
    </VerificationCodeCard>
  );
};
