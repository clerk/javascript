import { LoadingCard } from '@/ui/elements/LoadingCard';

import { UserVerificationSessionProvider, useUserVerificationSession } from './user-verification-session.model';

function withUserVerificationSessionGuard<P>(Component: React.ComponentType<P>): React.ComponentType<P> {
  const Guard = (props: P) => {
    const { isLoading, data } = useUserVerificationSession();

    if (isLoading || !data) {
      return <LoadingCard />;
    }

    return <Component {...(props as any)} />;
  };
  const Hoc = (props: P) => (
    <UserVerificationSessionProvider>
      <Guard {...(props as any)} />
    </UserVerificationSessionProvider>
  );

  const displayName = Component.displayName || Component.name || 'Component';
  Component.displayName = displayName;
  Hoc.displayName = displayName;
  return Hoc;
}

export { useUserVerificationSessionKey, useUserVerificationSession } from './user-verification-session.model';
export { withUserVerificationSessionGuard };
