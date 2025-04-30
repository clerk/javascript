import type { AlternativePhoneCodeStrategy } from '@clerk/types';

import { SignUpPhoneCodeCard } from './SignUpPhoneCodeCard';

type SignUpVerifyPhoneWithAlternativeProviderProps = {
  phoneCodeStrategy: AlternativePhoneCodeStrategy;
};

export const SignUpVerifyPhoneWithAlternativeProvider = ({
  phoneCodeStrategy,
}: SignUpVerifyPhoneWithAlternativeProviderProps) => {
  return <SignUpPhoneCodeCard phoneCodeStrategy={phoneCodeStrategy} />;
};
