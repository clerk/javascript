import { useClerk, useUser } from '@clerk/shared/react';
import type { PhoneCodeFactor } from '@clerk/types';

import { useUserVerification } from '../../contexts';
import { Flow, localizationKeys } from '../../customizables';
import { useRouter } from '../../router';
import type { UVFactorTwoCodeCard } from './UVFactorTwoCodeForm';
import { UVFactorTwoCodeForm } from './UVFactorTwoCodeForm';

type UVFactorTwoPhoneCodeCardProps = UVFactorTwoCodeCard & { factor: PhoneCodeFactor };

export const UVFactorTwoPhoneCodeCard = (props: UVFactorTwoPhoneCodeCardProps) => {
  const { user } = useUser();
  const { afterVerification, routing, afterVerificationUrl } = useUserVerification();
  const { closeUserVerification } = useClerk();
  const { navigate } = useRouter();

  const prepare = () => {
    const { phoneNumberId, strategy } = props.factor;
    return user!.verifySessionPrepareSecondFactor({ phoneNumberId, strategy });
  };

  const beforeEmit = async () => {
    if (routing === 'virtual') {
      /**
       * if `afterVerificationUrl` and modal redirect there,
       * else if `afterVerificationUrl` redirect there,
       * else If modal close it,
       */
      afterVerification?.();
      closeUserVerification();
    } else {
      if (afterVerificationUrl) {
        await navigate(afterVerificationUrl);
      }
    }
  };

  return (
    <Flow.Part part='phoneCode2Fa'>
      <UVFactorTwoCodeForm
        {...props}
        beforeEmit={beforeEmit}
        cardTitle={localizationKeys('signIn.phoneCodeMfa.title')}
        cardSubtitle={localizationKeys('signIn.phoneCodeMfa.subtitle')}
        inputLabel={localizationKeys('signIn.phoneCodeMfa.formTitle')}
        resendButton={localizationKeys('signIn.phoneCodeMfa.resendButton')}
        prepare={prepare}
      />
    </Flow.Part>
  );
};
