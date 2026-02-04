import { useOrganization } from '@clerk/shared/react';
import type { OrganizationProfileModalProps, OrganizationProfileProps } from '@clerk/shared/types';
import React from 'react';

import { ORGANIZATION_PROFILE_CARD_SCROLLBOX_ID } from '@/constants';
import { OrganizationProfileContext, SubscriberTypeContext, withCoreUserGuard } from '@/contexts';
import { Flow, localizationKeys } from '@/customizables';
import { withCardStateProvider } from '@/elements/contexts';
import { NavbarMenuButtonRow } from '@/elements/Navbar';
import { ProfileCard } from '@/elements/ProfileCard';
import type { WithInternalRouting } from '@/internal';
import { Route, Switch } from '@/router';
import type { OrganizationProfileCtx } from '@/types';

import { OrganizationProfileNavbar } from './OrganizationProfileNavbar';
import { OrganizationProfileRoutes } from './OrganizationProfileRoutes';

const OrganizationProfileInternal = () => {
  const { organization } = useOrganization();

  if (!organization) {
    return null;
  }

  return (
    <Flow.Root flow='organizationProfile'>
      <Flow.Part>
        <Switch>
          <Route>
            <SubscriberTypeContext.Provider value='organization'>
              <AuthenticatedRoutes />
            </SubscriberTypeContext.Provider>
          </Route>
        </Switch>
      </Flow.Part>
    </Flow.Root>
  );
};

const AuthenticatedRoutes = withCoreUserGuard(() => {
  const contentRef = React.useRef<HTMLDivElement>(null);
  return (
    <ProfileCard.Root
      sx={t => ({ display: 'grid', gridTemplateColumns: '1fr 3fr', height: t.sizes.$176, overflow: 'hidden' })}
    >
      <OrganizationProfileNavbar contentRef={contentRef}>
        <NavbarMenuButtonRow navbarTitleLocalizationKey={localizationKeys('organizationProfile.navbar.title')} />
        <ProfileCard.Content
          contentRef={contentRef}
          scrollBoxId={ORGANIZATION_PROFILE_CARD_SCROLLBOX_ID}
        >
          <OrganizationProfileRoutes />
        </ProfileCard.Content>
      </OrganizationProfileNavbar>
    </ProfileCard.Root>
  );
});

export const OrganizationProfile: React.ComponentType<OrganizationProfileProps> =
  withCardStateProvider(OrganizationProfileInternal);

const InternalOrganizationProfile: React.ComponentType<WithInternalRouting<OrganizationProfileProps>> =
  withCardStateProvider(OrganizationProfileInternal);

export const OrganizationProfileModal = (props: OrganizationProfileModalProps): JSX.Element => {
  const organizationProfileProps: OrganizationProfileCtx = {
    ...props,
    routing: 'virtual',
    componentName: 'OrganizationProfile',
    mode: 'modal',
  };

  return (
    <Route path='organizationProfile'>
      <OrganizationProfileContext.Provider value={organizationProfileProps}>
        {/*TODO: Used by InvisibleRootBox, can we simplify? */}
        <div>
          <InternalOrganizationProfile {...organizationProfileProps} />
        </div>
      </OrganizationProfileContext.Provider>
    </Route>
  );
};
