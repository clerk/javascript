import { lazy, Suspense } from 'react';

import { useCoreSession, withCoreUserGuard } from '../contexts';
const ImpersonationFab = lazy(() =>
  import(/* webpackChunkName: "ImpersonationFab" */ './../components/ImpersonationFab').then(module => ({
    default: module.ImpersonationFab,
  })),
);
const InternalThemeProvider = lazy(() => import('../styledSystem').then(m => ({ default: m.InternalThemeProvider })));

const LazyImpersonationFab = () => {
  const session = useCoreSession();
  const actor = session?.actor;
  const isImpersonating = !!actor;

  if (!isImpersonating || !session.user) {
    return null;
  }

  return (
    <Suspense>
      <InternalThemeProvider>
        <ImpersonationFab />
      </InternalThemeProvider>
    </Suspense>
  );
};

export default withCoreUserGuard(LazyImpersonationFab);
