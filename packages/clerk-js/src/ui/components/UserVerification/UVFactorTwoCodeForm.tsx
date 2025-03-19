import { useSession } from '@clerk/shared/react';
import type { PhoneCodeFactor, SessionVerificationResource, TOTPFactor } from '@clerk/types';
import React from 'react';

import type { VerificationCodeCardProps } from '../../elements';
import { useCardState, VerificationCodeCard } from '../../elements';
import type { LocalizationKey } from '../../localization';
import { handleError } from '../../utils';
import { useAfterVerification } from './use-after-verification';

export type UVFactorTwoCodeCard = Pick<VerificationCodeCardProps, 'onShowAlternativeMethodsClicked'> & {
  factor: PhoneCodeFactor | TOTPFactor;
  factorAlreadyPrepared: boolean;
  onFactorPrepare: () => void;
  prepare?: () => Promise<SessionVerificationResource>;
  showAlternativeMethods?: boolean;
};

type SignInFactorTwoCodeFormProps = UVFactorTwoCodeCard & {
  cardTitle: LocalizationKey;
  cardSubtitle: LocalizationKey;
  inputLabel: LocalizationKey;
  resendButton?: LocalizationKey;
};

export const UVFactorTwoCodeForm = (props: SignInFactorTwoCodeFormProps) => {
  const card = useCardState();
  const { session } = useSession();
  const { handleVerificationResponse } = useAfterVerification();

  React.useEffect(() => {
    if (props.factorAlreadyPrepared) {
      return;
    }

    void prepare?.();
  }, []);

  const prepare = props.prepare
    ? () =>
        props
          .prepare?.()
          .then(() => props.onFactorPrepare())
          .catch(err => handleError(err, [], card.setError))
    : undefined;

  const action: VerificationCodeCardProps['onCodeEntryFinishedAction'] = (code, resolve, reject) => {
    session!
      .attemptSecondFactorVerification({ strategy: props.factor.strategy, code })
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
      resendButton={props.resendButton}
      inputLabel={props.inputLabel}
      onCodeEntryFinishedAction={action}
      onResendCodeClicked={prepare}
      safeIdentifier={'safeIdentifier' in props.factor ? props.factor.safeIdentifier : undefined}
      profileImageUrl={session?.user?.imageUrl}
      onShowAlternativeMethodsClicked={props.onShowAlternativeMethodsClicked}
      showAlternativeMethods={props.showAlternativeMethods}
    />
  );
};
