import { useClerk } from '@clerk/shared/react';
import type { SignUpResource } from '@clerk/types';

import { forwardClerkQueryParams } from '../../../utils/getClerkQueryParam';
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
    const params = forwardClerkQueryParams();
    return navigate('../', { searchParams: params });
  };

  const action: VerificationCodeCardProps['onCodeEntryFinishedAction'] = (code, resolve, reject) => {
    void props
      .attempt(code)
      .then(async res => {
        await resolve();
        const params = forwardClerkQueryParams();

        if (res.unverifiedFields?.includes('email_address')) {
          return navigate('verify-email-address', { searchParams: params });
        }
        if (res.unverifiedFields?.includes('phone_number')) {
          return navigate('verify-phone-number', { searchParams: params });
        }

        if (afterSignUpUrl) {
          return completeSignUpFlow({
            signUp: res,
            verifyEmailPath: '../verify-email-address',
            verifyPhonePath: '../verify-phone-number',
            continuePath: '../continue',
            handleComplete: () => setActive({ session: res.createdSessionId, redirectUrl: afterSignUpUrl }),
            navigate: (path, options) => navigate(path, { ...options, searchParams: params }),
          });
        }
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
