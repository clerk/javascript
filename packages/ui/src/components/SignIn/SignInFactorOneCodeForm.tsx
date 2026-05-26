import type { EmailCodeFactor, PhoneCodeFactor, ResetPasswordCodeFactor } from '@clerk/shared/types';
import { useMemo } from 'react';

import { useCardState } from '@/ui/elements/contexts';
import type { VerificationCodeCardProps } from '@/ui/elements/VerificationCodeCard';
import { VerificationCodeCard } from '@/ui/elements/VerificationCodeCard';
import { handleError } from '@/ui/utils/errorHandler';

import { useCoreSignIn } from '../../contexts';
import { useFetch } from '../../hooks';
import { type LocalizationKey } from '../../localization';
import { useRouter } from '../../router';
import { useHandleFirstFactorResult, useHandleUserLockedError } from './useHandleAttemptResult';

export type SignInFactorOneCodeCard = Pick<
  VerificationCodeCardProps,
  'onShowAlternativeMethodsClicked' | 'showAlternativeMethods' | 'onBackLinkClicked'
> & {
  factor: EmailCodeFactor | PhoneCodeFactor | ResetPasswordCodeFactor;
  factorAlreadyPrepared: boolean;
  onFactorPrepare: () => void;
};

export type SignInFactorOneCodeFormProps = SignInFactorOneCodeCard & {
  cardTitle: LocalizationKey;
  cardSubtitle: LocalizationKey;
  inputLabel: LocalizationKey;
  resendButton: LocalizationKey;
};

export const SignInFactorOneCodeForm = (props: SignInFactorOneCodeFormProps) => {
  const signIn = useCoreSignIn();
  const card = useCardState();
  const { navigate } = useRouter();
  const handleFirstFactorResult = useHandleFirstFactorResult();
  const handleUserLockedError = useHandleUserLockedError();

  const shouldAvoidPrepare = signIn.firstFactorVerification.status === 'verified' && props.factorAlreadyPrepared;

  const cacheKey = useMemo(() => {
    const factor = props.factor;
    let factorKey = factor.strategy;

    if ('emailAddressId' in factor) {
      factorKey += `_${factor.emailAddressId}`;
    }
    if ('phoneNumberId' in factor) {
      factorKey += `_${factor.phoneNumberId}`;
    }
    if ('channel' in factor && factor.channel) {
      factorKey += `_${factor.channel}`;
    }

    return {
      name: 'signIn.prepareFirstFactor',
      factorKey,
    };
  }, [
    props.factor.strategy,
    'emailAddressId' in props.factor ? props.factor.emailAddressId : undefined,
    'phoneNumberId' in props.factor ? props.factor.phoneNumberId : undefined,
    'channel' in props.factor ? props.factor.channel : undefined,
  ]);

  const goBack = () => {
    return navigate('../');
  };

  const prepare = () => {
    if (shouldAvoidPrepare) {
      return;
    }

    void signIn
      .prepareFirstFactor(props.factor)
      .then(() => props.onFactorPrepare())
      .catch(err => handleError(err, [], card.setError));
  };

  useFetch(shouldAvoidPrepare ? undefined : () => signIn?.prepareFirstFactor(props.factor), cacheKey, {
    staleTime: 100,
    onSuccess: () => props.onFactorPrepare(),
    onError: err => handleError(err, [], card.setError),
  });

  const action: VerificationCodeCardProps['onCodeEntryFinishedAction'] = (code, resolve, reject) => {
    signIn
      .attemptFirstFactor({ strategy: props.factor.strategy, code })
      .then(async res => {
        await resolve();
        return handleFirstFactorResult(res);
      })
      .catch(err => {
        if (handleUserLockedError(err)) {
          return;
        }
        return reject(err);
      });
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
      profileImageUrl={signIn.userData.imageUrl}
      onShowAlternativeMethodsClicked={props.onShowAlternativeMethodsClicked}
      showAlternativeMethods={props.showAlternativeMethods}
      onIdentityPreviewEditClicked={goBack}
      onBackLinkClicked={props.onBackLinkClicked}
    />
  );
};
