import type { EmailCodeFactor, PhoneCodeFactor } from '@clerk/shared/types';

import { useCoreSignIn } from '../../contexts';

export const useSignInFactorTwoChannelCodeModel = (factor: EmailCodeFactor | PhoneCodeFactor) => {
  const signIn = useCoreSignIn();

  const prepare = async (): Promise<void> => {
    if ('emailAddressId' in factor) {
      const { emailAddressId, strategy } = factor;
      await signIn.prepareSecondFactor({ emailAddressId, strategy });
      return;
    }

    // TODO: Why does the BE throw an error if I simply pass
    // the whole factor?
    const { phoneNumberId, strategy } = factor;
    await signIn.prepareSecondFactor({ phoneNumberId, strategy });
  };

  return { prepare };
};
