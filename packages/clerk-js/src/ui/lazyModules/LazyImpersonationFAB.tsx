import type { Appearance } from '@clerk/types';
import { Suspense } from 'react';

import { ImpersonationFab } from './../components/ImpersonationFab';
import { AppearanceProvider } from './commonDeps';

type LazyImpersonationFabProps = {
  globalAppearance: Appearance | undefined;
};

/**
 * This component uses the Clerk singleton directly in an attempt not to load
 * and of the /ui dependencies until needed, as this component automatically
 * mounts when impersonating, without a user action.
 * We want to hotload the /ui dependencies only if we're actually impersonating.
 */
export const LazyImpersonationFab = (props: LazyImpersonationFabProps) => {
  return (
    <Suspense>
      <AppearanceProvider
        globalAppearance={props.globalAppearance}
        appearanceKey={'impersonationFab'}
      >
        <ImpersonationFab />
      </AppearanceProvider>
    </Suspense>
  );
};
