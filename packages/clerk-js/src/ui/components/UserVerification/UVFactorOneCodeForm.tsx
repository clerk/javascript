import { useSession } from '@clerk/shared/react';
import type { EmailCodeFactor, PhoneCodeFactor } from '@clerk/shared/types';
import React from 'react';

import { useCardState } from '@/ui/elements/contexts';
import type { VerificationCodeCardProps } from '@/ui/elements/VerificationCodeCard';
import { VerificationCodeCard } from '@/ui/elements/VerificationCodeCard';
import { handleError } from '@/ui/utils/errorHandler';

import type { LocalizationKey } from '../../localization';
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
  const { session } = useSession();
  const card = useCardState();

  const { handleVerificationResponse } = useAfterVerification();

  React.useEffect(() => {
    if (!props.factorAlreadyPrepared) {
      prepare();
    }
  }, []);

  const prepare = () => {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    void session!
      .prepareFirstFactorVerification(props.factor)
      .then(() => props.onFactorPrepare())
      .catch(err => handleError(err, [], card.setError));
  };

  const action: VerificationCodeCardProps['onCodeEntryFinishedAction'] = (code, resolve, reject) => {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    session!
      .attemptFirstFactorVerification({ strategy: props.factor.strategy, code })
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
      profileImageUrl={session?.user?.imageUrl}
      onShowAlternativeMethodsClicked={props.onShowAlternativeMethodsClicked}
      showAlternativeMethods={props.showAlternativeMethods}
      onBackLinkClicked={props.onBackLinkClicked}
    />
  );
};
