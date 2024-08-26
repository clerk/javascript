import { useClerk, useUser } from '@clerk/shared/react';
import type { EmailCodeFactor, PhoneCodeFactor } from '@clerk/types';
import React from 'react';

import { clerkInvalidFAPIResponse } from '../../../core/errors';
import { useUserVerification } from '../../contexts';
import type { VerificationCodeCardProps } from '../../elements';
import { useCardState, VerificationCodeCard } from '../../elements';
import { useSupportEmail } from '../../hooks/useSupportEmail';
import type { LocalizationKey } from '../../localization';
import { useRouter } from '../../router';
import { handleError } from '../../utils';

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
  const { afterVerification, routing, afterVerificationUrl } = useUserVerification();
  const { __experimental_closeUserVerification } = useClerk();
  const card = useCardState();
  const { navigate } = useRouter();
  const supportEmail = useSupportEmail();
  const clerk = useClerk();

  const goBack = () => {
    return navigate('../');
  };

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

  const beforeEmit = async () => {
    if (routing === 'virtual') {
      /**
       * if `afterVerificationUrl` and modal redirect there,
       * else if `afterVerificationUrl` redirect there,
       * else If modal close it,
       */
      afterVerification?.();
      __experimental_closeUserVerification();
    } else {
      if (afterVerificationUrl) {
        await navigate(afterVerificationUrl);
      }
    }
  };

  const action: VerificationCodeCardProps['onCodeEntryFinishedAction'] = (code, resolve, reject) => {
    user!
      .__experimental_verifySessionAttemptFirstFactor({ strategy: props.factor.strategy, code })
      .then(async res => {
        await resolve();
        switch (res.status) {
          case 'complete':
            return clerk.setActive({ session: res.session.id, beforeEmit });
          case 'needs_second_factor':
            return navigate('./factor-two');
          default:
            return console.error(clerkInvalidFAPIResponse(res.status, supportEmail));
        }
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
      onIdentityPreviewEditClicked={goBack}
      onBackLinkClicked={props.onBackLinkClicked}
    />
  );
};
