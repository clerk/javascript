import { useUser } from '@clerk/shared/react';

import { useUserVerification } from '../../contexts';
import { LoadingCard } from '../../elements';
import { useFetch } from '../../hooks';
import { useRouter } from '../../router';

const useUserVerificationSession = () => {
  const { user } = useUser();
  const { level } = useUserVerification();
  const data = useFetch(
    user ? user.verifySession : undefined,
    {
      level: level || 'L2.secondFactor',
    },
    {
      throttleTime: 300,
      staleTime: 2000,
    },
  );

  return data;
};

export function withUserVerificationSession<P>(Component: React.ComponentType<P>): React.ComponentType<P> {
  const Hoc = (props: P) => {
    const { isLoading, data } = useUserVerificationSession();
    const { navigate } = useRouter();

    if (isLoading || !data) {
      return <LoadingCard />;
    }

    if (data.status === 'needs_first_factor') {
      navigate('./');
    } else if (data.status === 'needs_second_factor') {
      navigate('./factor-two');
    }

    return <Component {...(props as any)} />;
  };

  const displayName = Component.displayName || Component.name || 'Component';
  Component.displayName = displayName;
  Hoc.displayName = displayName;
  return Hoc;
}

export { useUserVerificationSession };
