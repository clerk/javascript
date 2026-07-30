import type { ConfigureSSOProps } from '@clerk/shared/types';
import React from 'react';

import { withCoreUserGuard } from '@/contexts';
import { Flow } from '@/customizables';
import { withCardStateProvider } from '@/elements/contexts';
import { ProfileCard } from '@/elements/ProfileCard';
import { Route, Switch } from '@/router';

import { SetupFlowNavbar } from '../ConfigureIdentityProvider/SetupFlowNavbar';
import { ConfigureDirectorySyncWizard } from './ConfigureDirectorySyncWizard';

/**
 * PROTOTYPE ONLY — standalone host for the Directory Sync onboarding wizard,
 * mirroring ConfigureSSO's shell. Reuses the configureSSO flow id/appearance
 * so no new appearance surface is introduced for a throwaway.
 */
const ConfigureDirectorySyncInternal = (): JSX.Element => {
  return (
    <Flow.Root flow='configureSSO'>
      <Switch>
        <Route>
          <AuthenticatedContent />
        </Route>
      </Switch>
    </Flow.Root>
  );
};

const AuthenticatedContent = withCoreUserGuard(() => {
  const contentRef = React.useRef<HTMLDivElement>(null);

  return (
    <ProfileCard.Root
      sx={t => ({ display: 'grid', gridTemplateColumns: '1fr 3fr', height: t.sizes.$176, overflow: 'hidden' })}
    >
      <SetupFlowNavbar
        title='Configure Directory Sync'
        contentRef={contentRef}
      >
        <ConfigureDirectorySyncWizard />
      </SetupFlowNavbar>
    </ProfileCard.Root>
  );
});

export const ConfigureDirectorySync: React.ComponentType<ConfigureSSOProps> =
  withCardStateProvider(ConfigureDirectorySyncInternal);
