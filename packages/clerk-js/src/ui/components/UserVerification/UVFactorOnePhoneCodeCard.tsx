import type { PhoneCodeFactor } from '@clerk/shared/types';

import { Flow, localizationKeys } from '../../customizables';
import type { UVFactorOneCodeCard } from './UVFactorOneCodeForm';
import { UVFactorOneCodeForm } from './UVFactorOneCodeForm';

type UVFactorOnePhoneCodeCardProps = UVFactorOneCodeCard & { factor: PhoneCodeFactor };

export const UVFactorOnePhoneCodeCard = (props: UVFactorOnePhoneCodeCardProps) => {
  return (
    <Flow.Part part='phoneCode'>
      <UVFactorOneCodeForm
        {...props}
        cardTitle={localizationKeys('reverification.phoneCode.title')}
        cardSubtitle={localizationKeys('reverification.phoneCode.subtitle')}
        inputLabel={localizationKeys('reverification.phoneCode.formTitle')}
        resendButton={localizationKeys('reverification.phoneCode.resendButton')}
        showAlternativeMethods={props.showAlternativeMethods}
      />
    </Flow.Part>
  );
};
