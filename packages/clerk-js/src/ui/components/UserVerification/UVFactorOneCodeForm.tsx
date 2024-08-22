import { useClerk, useUser } from '@clerk/shared/react';
import type { EmailCodeFactor, PhoneCodeFactor } from '@clerk/types';
import React from 'react';

import { clerkInvalidFAPIResponse } from '../../../core/errors';
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
      .verifySessionPrepareFirstFactor(props.factor)
      .then(() => props.onFactorPrepare())
      .catch(err => handleError(err, [], card.setError));
  };

  const action: VerificationCodeCardProps['onCodeEntryFinishedAction'] = (code, resolve, reject) => {
    user!
      .verifySessionAttemptFirstFactor({ strategy: props.factor.strategy, code })
      .then(async res => {
        await resolve();
        switch (res.status) {
          case 'complete':
            return clerk.setActive({ session: res.session.id });
          case 'needs_second_factor':
            return navigate('./factor-two');
          // case 'needs_new_password':
          //   return navigate('../reset-password');
          default:
            return console.error(clerkInvalidFAPIResponse(res.status, supportEmail));
        }
      })
      .catch(err => {
        // TODO: WOuld this even be possible ?
        // if (isUserLockedError(err)) {
        //   // @ts-expect-error -- private method for the time being
        //   return clerk.__internal_navigateWithError('..', err.errors[0]);
        // }

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
      profileImageUrl={user?.imageUrl}
      onShowAlternativeMethodsClicked={props.onShowAlternativeMethodsClicked}
      showAlternativeMethods={props.showAlternativeMethods}
      onIdentityPreviewEditClicked={goBack}
      onBackLinkClicked={props.onBackLinkClicked}
    />
  );
};
