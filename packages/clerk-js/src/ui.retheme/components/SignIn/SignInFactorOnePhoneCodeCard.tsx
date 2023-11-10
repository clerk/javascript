import type { PhoneCodeFactor } from '@clerk/types';

import { useEnvironment } from '../../contexts';
import { Flow, localizationKeys } from '../../customizables';
import type { SignInFactorOneCodeCard } from './SignInFactorOneCodeForm';
import { SignInFactorOneCodeForm } from './SignInFactorOneCodeForm';

type SignInFactorOnePhoneCodeCardProps = SignInFactorOneCodeCard & { factor: PhoneCodeFactor };

export const SignInFactorOnePhoneCodeCard = (props: SignInFactorOnePhoneCodeCardProps) => {
  const { applicationName } = useEnvironment().displayConfig;

  return (
    <Flow.Part part='phoneCode'>
      <SignInFactorOneCodeForm
        {...props}
        cardTitle={localizationKeys('signIn.phoneCode.title')}
        cardSubtitle={localizationKeys('signIn.phoneCode.subtitle', { applicationName })}
        formTitle={localizationKeys('signIn.phoneCode.formTitle')}
        formSubtitle={localizationKeys('signIn.phoneCode.formSubtitle')}
        resendButton={localizationKeys('signIn.phoneCode.resendButton')}
      />
    </Flow.Part>
  );
};
