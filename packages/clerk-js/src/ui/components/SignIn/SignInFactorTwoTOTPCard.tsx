import type { TOTPFactor } from '@clerk/types';

import { Flow, localizationKeys } from '../../customizables';
import type { SignInFactorTwoCodeCard } from './SignInFactorTwoCodeForm';
import { SignInFactorTwoCodeForm } from './SignInFactorTwoCodeForm';

type SignInFactorTwoTOTPCardProps = SignInFactorTwoCodeCard & { factor: TOTPFactor };

export const SignInFactorTwoTOTPCard = (props: SignInFactorTwoTOTPCardProps) => {
  return (
    <Flow.Part part='totp2Fa'>
      <SignInFactorTwoCodeForm
        {...props}
        cardTitle={localizationKeys('signIn.totpMfa.title')}
        cardSubtitle={localizationKeys('signIn.totpMfa.subtitle')}
        formTitle={localizationKeys('signIn.totpMfa.formTitle')}
        formSubtitle={localizationKeys('signIn.totpMfa.formSubtitle')}
      />
    </Flow.Part>
  );
};
