import { useUser } from '@clerk/shared/react';
import { useState } from 'react';

import { useUserVerification } from '../../contexts';
import { LoadingCard } from '../../elements';
import { useFetch } from '../../hooks';

const useUserVerificationSession = () => {
  const { user } = useUser();
  const { level } = useUserVerification();
  const [isComplete, setComplete] = useState(false);
  const data = useFetch(
    user ? user.verifySession : undefined,
    {
      level: level || 'L2.secondFactor',
      // TODO: Figure out if this needs to be a prop
      maxAge: 'A1.10min',
    },
    {
      throttleTime: 300,
      onSuccess() {
        setComplete(true);
      },
    },
  );

  return { ...data, isComplete };
};

export function withUserVerificationSession<P>(Component: React.ComponentType<P>): React.ComponentType<P> {
  const Hoc = (props: P) => {
    const { isLoading, data } = useUserVerificationSession();
    // const { navigate } = useRouter();
    // console.log(useRouter());

    if (isLoading || !data) {
      return <LoadingCard />;
    }

    // if (data.status === 'needs_first_factor') {
    //   if (path !== './') {
    //     navigate('./');
    //   }
    // } else if (data.status === 'needs_second_factor') {
    //   if (path !== './') {
    //     navigate('./factor-two');
    //   }
    // }

    return <Component {...(props as any)} />;
  };

  const displayName = Component.displayName || Component.name || 'Component';
  Component.displayName = displayName;
  Hoc.displayName = displayName;
  return Hoc;
}

export { useUserVerificationSession };
