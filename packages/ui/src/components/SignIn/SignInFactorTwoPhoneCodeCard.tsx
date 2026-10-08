import type { PhoneCodeFactor } from '@clerk/shared/types';

import { useSignInFactorTwoChannelCodeModel } from './sign-in-factor-two-channel-code.model';
import { SignInFactorTwoChannelCodeView } from './sign-in-factor-two-channel-code.view';
import type { SignInFactorTwoCodeCard } from './SignInFactorTwoCodeForm';

type SignInFactorTwoPhoneCodeCardProps = SignInFactorTwoCodeCard & { factor: PhoneCodeFactor };

export const SignInFactorTwoPhoneCodeCard = (props: SignInFactorTwoPhoneCodeCardProps) => {
  const model = useSignInFactorTwoChannelCodeModel(props.factor);

  return (
    <SignInFactorTwoChannelCodeView
      props={props}
      prepare={model.prepare}
      variant='phone'
    />
  );
};
