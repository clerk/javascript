import { useUser } from '@clerk/shared/react';
import type { EmailCodeFactor, PhoneCodeFactor } from '@clerk/types';
import React from 'react';

import type { VerificationCodeCardProps } from '../../elements';
import { useCardState, VerificationCodeCard } from '../../elements';
import type { LocalizationKey } from '../../localization';
import { handleError } from '../../utils';
import { useAfterVerification } from './use-after-verification';

export type UVFactorOneCodeCard = Pick<
  VerificationCodeCardProps,
  'onShowAlternativeMethodsClicked' | 'showAlternativeMethods' | 'onBackLinkClicked'
> & {
  factor: EmailCodeFactor | PhoneCodeFactor;
  factorAlreadyPrepared: boolean;
  onFactorPrepare: () => void;
};

export type UVFactorOneCodeFormProps = UVFactorOneCodeCard & {
  cardTitle: LocalizationKey;
  cardSubtitle: LocalizationKey;
  inputLabel: LocalizationKey;
  resendButton: LocalizationKey;
};

export const UVFactorOneCodeForm = (props: UVFactorOneCodeFormProps) => {
  const { user } = useUser();
  const card = useCardState();

  const { handleVerificationResponse } = useAfterVerification();

  React.useEffect(() => {
    if (!props.factorAlreadyPrepared) {
      prepare();
    }
  }, []);

  const prepare = () => {
    void user!
      .__experimental_verifySessionPrepareFirstFactor(props.factor)
      .then(() => props.onFactorPrepare())
      .catch(err => handleError(err, [], card.setError));
  };

  const action: VerificationCodeCardProps['onCodeEntryFinishedAction'] = (code, resolve, reject) => {
    user!
      .__experimental_verifySessionAttemptFirstFactor({ strategy: props.factor.strategy, code })
      .then(async res => {
        await resolve();
        return handleVerificationResponse(res);
      })
      .catch(reject);
  };

  return (
    <VerificationCodeCard
      cardTitle={props.cardTitle}
      cardSubtitle={props.cardSubtitle}
      inputLabel={props.inputLabel}
      resendButton={props.resendButton}
      onCodeEntryFinishedAction={action}
      onResendCodeClicked={prepare}
      safeIdentifier={props.factor.safeIdentifier}
      profileImageUrl={user?.imageUrl}
      onShowAlternativeMethodsClicked={props.onShowAlternativeMethodsClicked}
      showAlternativeMethods={props.showAlternativeMethods}
      onBackLinkClicked={props.onBackLinkClicked}
    />
  );
};
