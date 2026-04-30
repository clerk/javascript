import type { __experimental_ConfigureSSOProps } from '@clerk/shared/types';
import React from 'react';

import { withCoreUserGuard } from '@/contexts';
import { Flow, localizationKeys } from '@/customizables';
import { withCardStateProvider } from '@/elements/contexts';
import { NavBar, NavbarContextProvider } from '@/elements/Navbar';
import { ProfileCard } from '@/elements/ProfileCard';
import { Route, Switch } from '@/router';

const ConfigureSSOInternal = () => {
  return (
    <Flow.Root flow='configureSSO'>
      <Flow.Part>
        <Switch>
          <Route>
            <AuthenticatedContent />
          </Route>
        </Switch>
      </Flow.Part>
    </Flow.Root>
  );
};

const AuthenticatedContent = withCoreUserGuard(() => {
  const contentRef = React.useRef<HTMLDivElement>(null);
  return (
    <ProfileCard.Root
      sx={t => ({ display: 'grid', gridTemplateColumns: '1fr 3fr', height: t.sizes.$176, overflow: 'hidden' })}
    >
      <NavbarContextProvider contentRef={contentRef}>
        <NavBar
          title={localizationKeys('configureSSO.navbar.title')}
          routes={[]}
          contentRef={contentRef}
        />
        <ProfileCard.Content contentRef={contentRef} />
      </NavbarContextProvider>
    </ProfileCard.Root>
  );
});

export const ConfigureSSO: React.ComponentType<__experimental_ConfigureSSOProps> =
  withCardStateProvider(ConfigureSSOInternal);
