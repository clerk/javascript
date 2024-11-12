import type { EmailCodeFactor } from '@clerk/types';

import { Flow, localizationKeys } from '../../customizables';
import type { UVFactorOneCodeCard } from './UVFactorOneCodeForm';
import { UVFactorOneCodeForm } from './UVFactorOneCodeForm';

type UVFactorOneEmailCodeCardProps = UVFactorOneCodeCard & { factor: EmailCodeFactor };

export const UVFactorOneEmailCodeCard = (props: UVFactorOneEmailCodeCardProps) => {
  return (
    <Flow.Part part='emailCode'>
      <UVFactorOneCodeForm
        {...props}
        cardTitle={localizationKeys('userVerification.emailCode.title')}
        cardSubtitle={localizationKeys('userVerification.emailCode.subtitle')}
        inputLabel={localizationKeys('userVerification.emailCode.formTitle')}
        resendButton={localizationKeys('userVerification.emailCode.resendButton')}
      />
    </Flow.Part>
  );
};
