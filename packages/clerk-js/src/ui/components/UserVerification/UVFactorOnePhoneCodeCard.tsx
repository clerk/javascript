import type { PhoneCodeFactor } from '@clerk/types';

import { Flow, localizationKeys } from '../../customizables';
import type { UVFactorOneCodeCard } from './UVFactorOneCodeForm';
import { UVFactorOneCodeForm } from './UVFactorOneCodeForm';

type UVFactorOnePhoneCodeCardProps = UVFactorOneCodeCard & { factor: PhoneCodeFactor };

export const UVFactorOnePhoneCodeCard = (props: UVFactorOnePhoneCodeCardProps) => {
  return (
    <Flow.Part part='phoneCode'>
      <UVFactorOneCodeForm
        {...props}
        cardTitle={localizationKeys('__experimental_userVerification.phoneCode.title')}
        cardSubtitle={localizationKeys('__experimental_userVerification.phoneCode.subtitle')}
        inputLabel={localizationKeys('__experimental_userVerification.phoneCode.formTitle')}
        resendButton={localizationKeys('__experimental_userVerification.phoneCode.resendButton')}
      />
    </Flow.Part>
  );
};
