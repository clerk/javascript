import { useUser } from '@clerk/shared/react';

import { useUserVerification } from '../../contexts';
import { LoadingCard } from '../../elements';
import { useFetch } from '../../hooks';

const useUserVerificationSession = () => {
  const { user } = useUser();
  const { level } = useUserVerification();
  const data = useFetch(
    user ? user.__experimental_verifySession : undefined,
    {
      level: level || 'L2.secondFactor',
      // TODO(STEP-UP): Figure out if this needs to be a prop
      maxAge: 'A1.10min',
    },
    {
      throttleTime: 300,
    },
  );

  return { ...data };
};

function withUserVerificationSessionGuard<P>(Component: React.ComponentType<P>): React.ComponentType<P> {
  const Hoc = (props: P) => {
    const { isLoading, data } = useUserVerificationSession();

    if (isLoading || !data) {
      return <LoadingCard />;
    }

    return <Component {...(props as any)} />;
  };

  const displayName = Component.displayName || Component.name || 'Component';
  Component.displayName = displayName;
  Hoc.displayName = displayName;
  return Hoc;
}

export { useUserVerificationSession, withUserVerificationSessionGuard };
