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
  const { navigate, queryParams } = useRouter();

  const goBack = () => {
    const params = new URLSearchParams();
    if (queryParams['__clerk_ticket']) {
      params.set('__clerk_ticket', queryParams['__clerk_ticket']);
    }
    if (queryParams['__clerk_status']) {
      params.set('__clerk_status', queryParams['__clerk_status']);
    }
    return navigate('../', { searchParams: params });
  };

  const action: VerificationCodeCardProps['onCodeEntryFinishedAction'] = (code, resolve, reject) => {
    void props
      .attempt(code)
      .then(async res => {
        await resolve();
        const params = new URLSearchParams();
        if (queryParams['__clerk_ticket']) {
          params.set('__clerk_ticket', queryParams['__clerk_ticket']);
        }
        if (queryParams['__clerk_status']) {
          params.set('__clerk_status', queryParams['__clerk_status']);
        }
        return completeSignUpFlow({
          signUp: res,
          verifyEmailPath: '../verify-email-address',
          verifyPhonePath: '../verify-phone-number',
          continuePath: '../continue',
          handleComplete: () => setActive({ session: res.createdSessionId, redirectUrl: afterSignUpUrl }),
          navigate: path => navigate(path, { searchParams: params }),
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
