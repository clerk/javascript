import type { EmailCodeFactor } from '@clerk/shared/types';

import { useSignInFactorTwoChannelCodeModel } from './sign-in-factor-two-channel-code.model';
import { SignInFactorTwoChannelCodeView } from './sign-in-factor-two-channel-code.view';
import type { SignInFactorTwoCodeCard } from './SignInFactorTwoCodeForm';

type SignInFactorTwoEmailCodeCardProps = SignInFactorTwoCodeCard & { factor: EmailCodeFactor };

export const SignInFactorTwoEmailCodeCard = (props: SignInFactorTwoEmailCodeCardProps) => {
  const model = useSignInFactorTwoChannelCodeModel(props.factor);

  return (
    <SignInFactorTwoChannelCodeView
      props={props}
      prepare={model.prepare}
      variant='email'
    />
  );
};
