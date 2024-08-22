import type { EmailCodeFactor } from '@clerk/types';

import { Flow, localizationKeys } from '../../customizables';
import type { UVFactorOneCodeCard } from './UVFactorOneCodeForm';
import { UVFactorOneCodeForm } from './UVFactorOneCodeForm';

type UVFactorOneEmailCodeCardProps = UVFactorOneCodeCard & { factor: EmailCodeFactor };

export const UVFactorOneEmailCodeCard = (props: UVFactorOneEmailCodeCardProps) => {
  // TODO: Update texts
  return (
    <Flow.Part part='emailCode'>
      <UVFactorOneCodeForm
        {...props}
        cardTitle={localizationKeys('signIn.emailCode.title')}
        cardSubtitle={localizationKeys('signIn.emailCode.subtitle')}
        inputLabel={localizationKeys('signIn.emailCode.formTitle')}
        resendButton={localizationKeys('signIn.emailCode.resendButton')}
      />
    </Flow.Part>
  );
};
