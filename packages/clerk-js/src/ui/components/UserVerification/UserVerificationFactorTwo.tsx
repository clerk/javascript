import { useUser } from '@clerk/shared/react';

import { LoadingCard, withCardStateProvider } from '../../elements';
import { useFetch } from '../../hooks';
import { UserVerificationFactorTwoTOTP } from './UserVerificationFactorTwoTOTP';

export function _UserVerificationFactorTwo(): JSX.Element {
  const { user } = useUser();
  // const card = useCardState();

  const { isLoading } = useFetch(user?.verifySession, undefined, {
    staleTime: 2000,
  });

  if (isLoading) {
    return <LoadingCard />;
  }

  return <UserVerificationFactorTwoTOTP />;
}

export const UserVerificationFactorTwo = withCardStateProvider(_UserVerificationFactorTwo);
