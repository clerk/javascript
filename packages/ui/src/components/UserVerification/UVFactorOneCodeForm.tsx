import { useSession } from '@clerk/shared/react';
import type {
  EmailCodeFactor,
  PhoneCodeFactor,
  ResetPasswordCodeFactor,
  SessionVerificationResource,
} from '@clerk/shared/types';
import React from 'react';

import { useCardState } from '@/ui/elements/contexts';
import type { VerificationCodeCardProps } from '@/ui/elements/VerificationCodeCard';
import { VerificationCodeCard } from '@/ui/elements/VerificationCodeCard';
import { handleError } from '@/ui/utils/errorHandler';

import type { LocalizationKey } from '../../localization';
import { localizationKeys } from '../../localization';
import { useAfterVerification } from './use-after-verification';

export type UVFactorOneCodeCard = Pick<
  VerificationCodeCardProps,
  'onShowAlternativeMethodsClicked' | 'showAlternativeMethods' | 'onBackLinkClicked'
> & {
  factor: EmailCodeFactor | PhoneCodeFactor | ResetPasswordCodeFactor;
  factorAlreadyPrepared: boolean;
  onFactorPrepare: () => void;
};

/**
 * An email or phone code is attempted with just the strategy and code. A reset
 * password code must carry the new password, so its caller passes the attempt.
 */
type UVFactorOneCodeAttempt =
  | {
      factor: EmailCodeFactor | PhoneCodeFactor;
      attempt?: undefined;
      onAttemptError?: undefined;
    }
  | {
      factor: ResetPasswordCodeFactor;
      attempt: (code: string) => Promise<SessionVerificationResource>;
      /**
       * Handles a failed attempt. Defaults to showing the error on the code card.
       */
      onAttemptError?: (err: unknown, reject: (err: unknown) => Promise<void>) => void;
    };

export type UVFactorOneCodeFormProps = UVFactorOneCodeCard &
  UVFactorOneCodeAttempt & {
    cardTitle: LocalizationKey;
    cardSubtitle: LocalizationKey;
    inputLabel: LocalizationKey;
    resendButton: LocalizationKey;
    identityPreviewEditButtonAriaLabel: LocalizationKey;
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
    const attempt = props.attempt
      ? props.attempt(code)
      : // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        session!.attemptFirstFactorVerification({ strategy: props.factor.strategy, code });
    attempt
      .then(async res => {
        await resolve();
        return handleVerificationResponse(res);
      })
      .catch(err => (props.onAttemptError ? props.onAttemptError(err, reject) : reject(err)));
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
      identityPreviewEditButtonAriaLabel={props.identityPreviewEditButtonAriaLabel}
      onShowAlternativeMethodsClicked={props.onShowAlternativeMethodsClicked}
      showAlternativeMethods={props.showAlternativeMethods}
      onBackLinkClicked={props.onBackLinkClicked}
      backLinkLabel={localizationKeys('backButton')}
    />
  );
};
