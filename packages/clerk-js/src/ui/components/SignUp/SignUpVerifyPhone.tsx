import { useEffect } from 'react';

import { useCoreSignUp } from '../../contexts';
import { useRouter } from '../../router';
import { SignUpPhoneCodeCard } from './SignUpPhoneCodeCard';

export const SignUpVerifyPhone = () => {
  const signUp = useCoreSignUp();
  const router = useRouter();

  //TODO: remove this once a global solution for route validation is ready
  useEffect(() => {
    if (!signUp.phoneNumber) {
      void router.navigate('../');
    }
  }, []);

  return <SignUpPhoneCodeCard />;
};
