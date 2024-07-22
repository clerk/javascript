import { useUser } from '@clerk/shared/react';

import { LoadingCard, withCardStateProvider } from '../../elements';
import { useFetch } from '../../hooks';
import { UserVerificationFactorOnePasswordCard } from './UserVerificationFactorOnePassword';

export function _UserVerificationFactorOne(): JSX.Element {
  const { user } = useUser();
  // const card = useCardState();

  const { isLoading } = useFetch(user?.verifySession, undefined, {
    staleTime: 2000,
  });

  if (isLoading) {
    return <LoadingCard />;
  }

  return <UserVerificationFactorOnePasswordCard />;
}

export const UserVerificationFactorOne = withCardStateProvider(_UserVerificationFactorOne);
