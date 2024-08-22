import { useEffect } from 'react';

import { withCardStateProvider } from '../../elements';
import { useRouter } from '../../router';
import { UserVerificationFactorTwoTOTP } from './UserVerificationFactorTwoTOTP';
import { useUserVerificationSession, withUserVerificationSession } from './useUserVerificationSession';

export function _UserVerificationFactorTwo(): JSX.Element {
  const { navigate } = useRouter();
  const { data } = useUserVerificationSession();
  const sessionVerification = data!;
  useEffect(() => {
    if (sessionVerification.status === 'needs_first_factor') {
      void navigate('../');
    }
  }, []);
  return <UserVerificationFactorTwoTOTP />;
}

export const UserVerificationFactorTwo = withUserVerificationSession(withCardStateProvider(_UserVerificationFactorTwo));
