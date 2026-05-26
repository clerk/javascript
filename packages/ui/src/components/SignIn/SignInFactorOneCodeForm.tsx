import type { EmailCodeFactor, PhoneCodeFactor, ResetPasswordCodeFactor, SignInResource } from '@clerk/shared/types';
import { useMemo } from 'react';

import { useCardState } from '@/ui/elements/contexts';
import type { VerificationCodeCardProps } from '@/ui/elements/VerificationCodeCard';
import { VerificationCodeCard } from '@/ui/elements/VerificationCodeCard';
import { handleError } from '@/ui/utils/errorHandler';

import { useFetch } from '../../hooks';
import { type LocalizationKey } from '../../localization';

export type SignInFactorOneCodeCard = Pick<
  VerificationCodeCardProps,
  'onShowAlternativeMethodsClicked' | 'showAlternativeMethods' | 'onBackLinkClicked'
> & {
  factor: EmailCodeFactor | PhoneCodeFactor | ResetPasswordCodeFactor;
  factorAlreadyPrepared: boolean;
  onFactorPrepare: () => void;
  onAttemptCode: VerificationCodeCardProps['onCodeEntryFinishedAction'];
  onPrepare: (factor: EmailCodeFactor | PhoneCodeFactor | ResetPasswordCodeFactor) => Promise<SignInResource>;
  onGoBack: () => void;
  identifier: string | null;
  avatarUrl: string | undefined;
  shouldAvoidPrepare: boolean;
};

export type SignInFactorOneCodeFormProps = SignInFactorOneCodeCard & {
  cardTitle: LocalizationKey;
  cardSubtitle: LocalizationKey;
  inputLabel: LocalizationKey;
  resendButton: LocalizationKey;
};

export const SignInFactorOneCodeForm = (props: SignInFactorOneCodeFormProps) => {
  const card = useCardState();

  const cacheKey = useMemo(() => {
    const factor = props.factor;
    let key = factor.strategy as string;

    if ('emailAddressId' in factor) {
      key += `_${factor.emailAddressId}`;
    }
    if ('phoneNumberId' in factor) {
      key += `_${factor.phoneNumberId}`;
    }
    if ('channel' in factor && factor.channel) {
      key += `_${factor.channel}`;
    }

    return {
      name: 'signIn.prepareFirstFactor',
      factorKey: key,
    };
  }, [
    props.factor.strategy,
    'emailAddressId' in props.factor ? props.factor.emailAddressId : undefined,
    'phoneNumberId' in props.factor ? props.factor.phoneNumberId : undefined,
    'channel' in props.factor ? props.factor.channel : undefined,
  ]);

  const prepare = () => {
    if (props.shouldAvoidPrepare) {
      return;
    }

    void props
      .onPrepare(props.factor)
      .then(() => props.onFactorPrepare())
      .catch(err => handleError(err, [], card.setError));
  };

  useFetch(props.shouldAvoidPrepare ? undefined : () => props.onPrepare(props.factor), cacheKey, {
    staleTime: 100,
    onSuccess: () => props.onFactorPrepare(),
    onError: err => handleError(err, [], card.setError),
  });

  return (
    <VerificationCodeCard
      cardTitle={props.cardTitle}
      cardSubtitle={props.cardSubtitle}
      inputLabel={props.inputLabel}
      resendButton={props.resendButton}
      onCodeEntryFinishedAction={props.onAttemptCode}
      onResendCodeClicked={prepare}
      safeIdentifier={props.factor.safeIdentifier}
      profileImageUrl={props.avatarUrl}
      onShowAlternativeMethodsClicked={props.onShowAlternativeMethodsClicked}
      showAlternativeMethods={props.showAlternativeMethods}
      onIdentityPreviewEditClicked={props.onGoBack}
      onBackLinkClicked={props.onBackLinkClicked}
    />
  );
};
