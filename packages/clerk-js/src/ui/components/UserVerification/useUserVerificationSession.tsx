import { useSession } from '@clerk/shared/react';
import { useMemo } from 'react';

import { useUserVerification } from '../../contexts';
import { LoadingCard } from '../../elements';
import { useFetch } from '../../hooks';

const useUserVerificationSessionKey = () => {
  const { level } = useUserVerification();
  return useMemo(
    () => ({
      level: level || 'secondFactor',
    }),
    [level],
  );
};

const useUserVerificationSession = () => {
  const { session } = useSession();
  const key = useUserVerificationSessionKey();
  const data = useFetch(session ? session.__experimental_startVerification : undefined, key, {
    throttleTime: 300,
  });

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

export { useUserVerificationSessionKey, useUserVerificationSession, withUserVerificationSessionGuard };
