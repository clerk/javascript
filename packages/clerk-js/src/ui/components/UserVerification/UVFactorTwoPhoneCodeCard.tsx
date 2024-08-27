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
        cardTitle={localizationKeys('signIn.phoneCodeMfa.title')}
        cardSubtitle={localizationKeys('signIn.phoneCodeMfa.subtitle')}
        inputLabel={localizationKeys('signIn.phoneCodeMfa.formTitle')}
        resendButton={localizationKeys('signIn.phoneCodeMfa.resendButton')}
        prepare={prepare}
      />
    </Flow.Part>
  );
};
