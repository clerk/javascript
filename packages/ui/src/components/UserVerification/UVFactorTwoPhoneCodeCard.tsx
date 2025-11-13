import { useSession } from '@clerk/shared/react';
import type { PhoneCodeFactor } from '@clerk/shared/types';

import { Flow, localizationKeys } from '../../customizables';
import type { UVFactorTwoCodeCard } from './UVFactorTwoCodeForm';
import { UVFactorTwoCodeForm } from './UVFactorTwoCodeForm';

type UVFactorTwoPhoneCodeCardProps = UVFactorTwoCodeCard & { factor: PhoneCodeFactor };
export const UVFactorTwoPhoneCodeCard = (props: UVFactorTwoPhoneCodeCardProps) => {
  const { session } = useSession();

  const prepare = () => {
    const { phoneNumberId, strategy } = props.factor;
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return session!.prepareSecondFactorVerification({ phoneNumberId, strategy });
  };

  return (
    <Flow.Part part='phoneCode2Fa'>
      <UVFactorTwoCodeForm
        {...props}
        cardTitle={localizationKeys('reverification.phoneCodeMfa.title')}
        cardSubtitle={localizationKeys('reverification.phoneCodeMfa.subtitle')}
        inputLabel={localizationKeys('reverification.phoneCodeMfa.formTitle')}
        resendButton={localizationKeys('reverification.phoneCodeMfa.resendButton')}
        prepare={prepare}
      />
    </Flow.Part>
  );
};
