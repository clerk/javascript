import type { TOTPFactor } from '@clerk/types';

import { Flow, localizationKeys } from '../../customizables';
import type { UVFactorTwoCodeCard } from './UVFactorTwoCodeForm';
import { UVFactorTwoCodeForm } from './UVFactorTwoCodeForm';

type UVFactorTwoTOTPCardProps = UVFactorTwoCodeCard & { factor: TOTPFactor };

export function UserVerificationFactorTwoTOTP(props: UVFactorTwoTOTPCardProps): JSX.Element {
  return (
    <Flow.Part part='totp2Fa'>
      <UVFactorTwoCodeForm
        {...props}
        cardTitle={localizationKeys('__experimental_userVerification.totpMfa.title')}
        cardSubtitle={localizationKeys('__experimental_userVerification.totpMfa.subtitle')}
        inputLabel={localizationKeys('__experimental_userVerification.totpMfa.formTitle')}
      />
    </Flow.Part>
  );
}
