import { useUser } from '@clerk/shared/react';
import type { PhoneCodeFactor } from '@clerk/types';

import { Flow, localizationKeys } from '../../customizables';
import type { UVFactorTwoCodeCard } from './UVFactorTwoCodeForm';
import { UVFactorTwoCodeForm } from './UVFactorTwoCodeForm';

type UVFactorTwoPhoneCodeCardProps = UVFactorTwoCodeCard & { factor: PhoneCodeFactor };

export const UVFactorTwoPhoneCodeCard = (props: UVFactorTwoPhoneCodeCardProps) => {
  const { user } = useUser();

  const prepare = () => {
    const { phoneNumberId, strategy } = props.factor;
    return user!.__experimental_verifySessionPrepareSecondFactor({ phoneNumberId, strategy });
  };

  return (
    <Flow.Part part='phoneCode2Fa'>
      <UVFactorTwoCodeForm
        {...props}
        cardTitle={localizationKeys('__experimental_userVerification.phoneCodeMfa.title')}
        cardSubtitle={localizationKeys('__experimental_userVerification.phoneCodeMfa.subtitle')}
        inputLabel={localizationKeys('__experimental_userVerification.phoneCodeMfa.formTitle')}
        resendButton={localizationKeys('__experimental_userVerification.phoneCodeMfa.resendButton')}
        prepare={prepare}
      />
    </Flow.Part>
  );
};
