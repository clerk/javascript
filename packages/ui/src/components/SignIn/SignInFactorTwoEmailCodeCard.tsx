import type { EmailCodeFactor, SignInResource } from '@clerk/shared/types';

import { Flow, localizationKeys } from '../../customizables';
import type { SignInFactorTwoCodeCard } from './SignInFactorTwoCodeForm';
import { SignInFactorTwoCodeForm } from './SignInFactorTwoCodeForm';

type SignInFactorTwoEmailCodeCardProps = SignInFactorTwoCodeCard & {
  factor: EmailCodeFactor;
  onPrepareSecondFactor: (factor: EmailCodeFactor) => Promise<SignInResource>;
};

export const SignInFactorTwoEmailCodeCard = (props: SignInFactorTwoEmailCodeCardProps) => {
  const { onPrepareSecondFactor, ...rest } = props;

  const prepare = () => {
    const { emailAddressId, strategy } = props.factor;
    return onPrepareSecondFactor({ emailAddressId, strategy } as EmailCodeFactor);
  };

  return (
    <Flow.Part part='emailCode2Fa'>
      <SignInFactorTwoCodeForm
        {...rest}
        cardTitle={localizationKeys('signIn.emailCodeMfa.title')}
        cardSubtitle={localizationKeys('signIn.emailCodeMfa.subtitle')}
        inputLabel={localizationKeys('signIn.emailCodeMfa.formTitle')}
        resendButton={localizationKeys('signIn.emailCodeMfa.resendButton')}
        prepare={prepare}
      />
    </Flow.Part>
  );
};
