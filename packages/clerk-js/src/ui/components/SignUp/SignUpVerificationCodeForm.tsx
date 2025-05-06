import { useClerk } from '@clerk/shared/react';
import type { AlternativePhoneCodeProvider, SignUpResource } from '@clerk/types';

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
  const { navigate, currentPath } = useRouter();

  const alternativePhoneCodeProvider = getAlternativePhoneCodeProviderFromPath(currentPath);

  const goBack = () => {
    return navigate(alternativePhoneCodeProvider ? '../../' : '../');
  };

  const action: VerificationCodeCardProps['onCodeEntryFinishedAction'] = (code, resolve, reject) => {
    void props
      .attempt(code)
      .then(async res => {
        await resolve();
        return completeSignUpFlow({
          signUp: res,
          verifyEmailPath: '../verify-email-address',
          verifyPhonePath: alternativePhoneCodeProvider
            ? `../verify-phone-number/${alternativePhoneCodeProvider}`
            : '../verify-phone-number',
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

const getAlternativePhoneCodeProviderFromPath = (currentPath: string): AlternativePhoneCodeProvider | null => {
  if (!currentPath) {
    return null;
  }

  const verifyPhoneRegex = /(?:.*\/)?verify-phone-number(?:\/([^/]+))?$/;
  const match = currentPath.match(verifyPhoneRegex);

  // If matched and capture group exists (the segment after verify-phone-number)
  if (match && match[1]) {
    return match[1] as AlternativePhoneCodeProvider;
  }

  return null;
};
