import type { PhoneCodeFactor, SignInResource } from '@clerk/shared/types';

import { Flow, localizationKeys } from '../../customizables';
import type { SignInFactorTwoCodeCard } from './SignInFactorTwoCodeForm';
import { SignInFactorTwoCodeForm } from './SignInFactorTwoCodeForm';

type SignInFactorTwoPhoneCodeCardProps = SignInFactorTwoCodeCard & {
  factor: PhoneCodeFactor;
  onPrepareSecondFactor: (factor: PhoneCodeFactor) => Promise<SignInResource>;
};

export const SignInFactorTwoPhoneCodeCard = (props: SignInFactorTwoPhoneCodeCardProps) => {
  const { onPrepareSecondFactor, ...rest } = props;

  const prepare = () => {
    const { phoneNumberId, strategy } = props.factor;
    return onPrepareSecondFactor({ phoneNumberId, strategy } as PhoneCodeFactor);
  };

  return (
    <Flow.Part part='phoneCode2Fa'>
      <SignInFactorTwoCodeForm
        {...rest}
        cardTitle={localizationKeys('signIn.phoneCodeMfa.title')}
        cardSubtitle={localizationKeys('signIn.phoneCodeMfa.subtitle')}
        inputLabel={localizationKeys('signIn.phoneCodeMfa.formTitle')}
        resendButton={localizationKeys('signIn.phoneCodeMfa.resendButton')}
        prepare={prepare}
      />
    </Flow.Part>
  );
};
