import type { TOTPFactor } from '@clerk/shared/types';

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
        inputLabel={localizationKeys('signIn.totpMfa.formTitle')}
      />
    </Flow.Part>
  );
};
