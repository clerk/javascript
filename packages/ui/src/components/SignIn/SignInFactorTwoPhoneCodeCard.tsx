import type { PhoneCodeFactor } from '@clerk/shared/types';

import { useCoreSignIn } from '../../contexts';
import { Flow, localizationKeys } from '../../customizables';
import type { SignInFactorTwoCodeCard } from './SignInFactorTwoCodeForm';
import { SignInFactorTwoCodeForm } from './SignInFactorTwoCodeForm';

type SignInFactorTwoPhoneCodeCardProps = SignInFactorTwoCodeCard & { factor: PhoneCodeFactor };

export const SignInFactorTwoPhoneCodeCard = (props: SignInFactorTwoPhoneCodeCardProps) => {
  const signIn = useCoreSignIn();

  const prepare = () => {
    // TODO: Why does the BE throw an error if I simply pass
    // the whole factor?
    const { phoneNumberId, strategy } = props.factor;
    return signIn.prepareSecondFactor({ phoneNumberId, strategy });
  };

  return (
    <Flow.Part part='phoneCode2Fa'>
      <SignInFactorTwoCodeForm
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
