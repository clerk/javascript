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
        cardTitle={localizationKeys('__experimental_userVerification.emailCode.title')}
        cardSubtitle={localizationKeys('__experimental_userVerification.emailCode.subtitle')}
        inputLabel={localizationKeys('__experimental_userVerification.emailCode.formTitle')}
        resendButton={localizationKeys('__experimental_userVerification.emailCode.resendButton')}
      />
    </Flow.Part>
  );
};
