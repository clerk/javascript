import { useClerk } from '@clerk/shared/react';
import type { SignUpResource } from '@clerk/types';

import { useSignUpContext } from '../../contexts';
import type { LocalizationKey } from '../../customizables';
import type { VerificationCodeCardProps } from '../../elements';
import { VerificationCodeCard } from '../../elements';
import { useRouter } from '../../router';
import { completeSignUpFlow } from './util';

type SignInFactorOneCodeFormProps = {
  cardTitle: LocalizationKey;
  cardSubtitle: LocalizationKey;
  inputLabel?: LocalizationKey;
  resendButton: LocalizationKey;
  prepare: () => Promise<SignUpResource | void> | undefined;
  attempt: (code: string) => Promise<SignUpResource>;
  safeIdentifier?: string | undefined | null;
};

export const SignUpVerificationCodeForm = (props: SignInFactorOneCodeFormProps) => {
  const { afterSignUpUrl } = useSignUpContext();
  const { setActive } = useClerk();
  const { navigate } = useRouter();

  const goBack = () => {
    return navigate('../');
  };

  const action: VerificationCodeCardProps['onCodeEntryFinishedAction'] = (code, resolve, reject) => {
    void props
      .attempt(code)
      .then(async res => {
        await resolve();
        return completeSignUpFlow({
          signUp: res,
          verifyEmailPath: '../verify-email-address',
          verifyPhonePath: '../verify-phone-number',
          continuePath: '../continue',
          handleComplete: () => setActive({ session: res.createdSessionId, redirectUrl: afterSignUpUrl }),
          navigate,
        });
      })
      .catch(err => {
        // TODO: Check if this is enough
        return reject(err);
      });
  };

  return (
    <VerificationCodeCard
      cardTitle={props.cardTitle}
      cardSubtitle={props.cardSubtitle}
      resendButton={props.resendButton}
      onCodeEntryFinishedAction={action}
      onResendCodeClicked={props.prepare}
      safeIdentifier={props.safeIdentifier}
      onIdentityPreviewEditClicked={goBack}
    />
  );
};
