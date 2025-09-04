import { useClerk } from '@clerk/shared/react';
import type { SignUpResource } from '@clerk/types';

import type { VerificationCodeCardProps } from '@/ui/elements/VerificationCodeCard';
import { VerificationCodeCard } from '@/ui/elements/VerificationCodeCard';

import { forwardClerkQueryParams } from '../../../utils/getClerkQueryParam';
import { useSignUpContext } from '../../contexts';
import type { LocalizationKey } from '../../customizables';
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
  alternativeMethodsLabel?: LocalizationKey;
  onShowAlternativeMethodsClicked?: React.MouseEventHandler;
  showAlternativeMethods?: boolean;
};

export const SignUpVerificationCodeForm = (props: SignInFactorOneCodeFormProps) => {
  const { afterSignUpUrl, navigateOnSetActive } = useSignUpContext();
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
        return completeSignUpFlow({
          signUp: res,
          verifyEmailPath: '../verify-email-address',
          verifyPhonePath: '../verify-phone-number',
          continuePath: '../continue',
          handleComplete: () =>
            setActive({
              session: res.createdSessionId,
              navigate: async ({ session }) => {
                await navigateOnSetActive({ session, redirectUrl: afterSignUpUrl });
              },
            }),
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
      alternativeMethodsLabel={props.alternativeMethodsLabel}
      onShowAlternativeMethodsClicked={props.onShowAlternativeMethodsClicked}
      showAlternativeMethods={props.showAlternativeMethods}
    />
  );
};
