import type { TOTPFactor } from '@clerk/shared/types';

import { Flow, localizationKeys } from '../../customizables';
import type { UVFactorTwoCodeCard } from './UVFactorTwoCodeForm';
import { UVFactorTwoCodeForm } from './UVFactorTwoCodeForm';

type UVFactorTwoTOTPCardProps = UVFactorTwoCodeCard & { factor: TOTPFactor };

export function UserVerificationFactorTwoTOTP(props: UVFactorTwoTOTPCardProps): JSX.Element {
  return (
    <Flow.Part part='totp2Fa'>
      <UVFactorTwoCodeForm
        {...props}
        cardTitle={localizationKeys('reverification.totpMfa.title')}
        cardSubtitle={localizationKeys('reverification.totpMfa.subtitle')}
        inputLabel={localizationKeys('reverification.totpMfa.formTitle')}
        showAlternativeMethods={props.showAlternativeMethods}
      />
    </Flow.Part>
  );
}
