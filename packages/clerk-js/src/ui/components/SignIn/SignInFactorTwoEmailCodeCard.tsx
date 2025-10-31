import type { EmailCodeFactor } from '@clerk/types';

import { useCoreSignIn } from '../../contexts';
import { Flow, localizationKeys } from '../../customizables';
import type { SignInFactorTwoCodeCard } from './SignInFactorTwoCodeForm';
import { SignInFactorTwoCodeForm } from './SignInFactorTwoCodeForm';

type SignInFactorTwoEmailCodeCardProps = SignInFactorTwoCodeCard & { factor: EmailCodeFactor };

export const SignInFactorTwoEmailCodeCard = (props: SignInFactorTwoEmailCodeCardProps) => {
  const signIn = useCoreSignIn();

  const prepare = () => {
    // TODO: Why does the BE throw an error if I simply pass
    // the whole factor?
    const { emailAddressId, strategy } = props.factor;
    return signIn.prepareSecondFactor({ emailAddressId, strategy });
  };

  // TODO: Update the part, card title, etc.
  return (
    <Flow.Part part='emailCode2Fa'>
      <SignInFactorTwoCodeForm
        {...props}
        cardTitle={localizationKeys('signIn.emailCodeMfa.title')}
        cardSubtitle={localizationKeys('signIn.emailCodeMfa.subtitle')}
        inputLabel={localizationKeys('signIn.emailCodeMfa.formTitle')}
        resendButton={localizationKeys('signIn.emailCodeMfa.resendButton')}
        prepare={prepare}
      />
    </Flow.Part>
  );
};
