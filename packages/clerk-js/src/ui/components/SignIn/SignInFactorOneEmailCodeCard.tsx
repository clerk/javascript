import type { EmailCodeFactor } from '@clerk/types';

import { Flow, localizationKeys } from '../../customizables';
import type { SignInFactorOneCodeCard } from './SignInFactorOneCodeForm';
import { SignInFactorOneCodeForm } from './SignInFactorOneCodeForm';

type SignInFactorOneEmailCodeCardProps = SignInFactorOneCodeCard & { factor: EmailCodeFactor };

export const SignInFactorOneEmailCodeCard = (props: SignInFactorOneEmailCodeCardProps) => {
  return (
    <Flow.Part part='emailCode'>
      <SignInFactorOneCodeForm
        {...props}
        cardTitle={localizationKeys('signIn.emailCode.title')}
        cardSubtitle={localizationKeys('signIn.emailCode.subtitle')}
        inputLabel={localizationKeys('signIn.emailCode.inputLabel')}
        resendButton={localizationKeys('signIn.emailCode.resendButton')}
      />
    </Flow.Part>
  );
};
