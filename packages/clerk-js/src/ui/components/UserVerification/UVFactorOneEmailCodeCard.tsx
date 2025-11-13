import type { EmailCodeFactor } from '@clerk/shared/types';

import { Flow, localizationKeys } from '../../customizables';
import type { UVFactorOneCodeCard } from './UVFactorOneCodeForm';
import { UVFactorOneCodeForm } from './UVFactorOneCodeForm';

type UVFactorOneEmailCodeCardProps = UVFactorOneCodeCard & { factor: EmailCodeFactor };

export const UVFactorOneEmailCodeCard = (props: UVFactorOneEmailCodeCardProps) => {
  return (
    <Flow.Part part='emailCode'>
      <UVFactorOneCodeForm
        {...props}
        cardTitle={localizationKeys('reverification.emailCode.title')}
        cardSubtitle={localizationKeys('reverification.emailCode.subtitle')}
        inputLabel={localizationKeys('reverification.emailCode.formTitle')}
        resendButton={localizationKeys('reverification.emailCode.resendButton')}
      />
    </Flow.Part>
  );
};
