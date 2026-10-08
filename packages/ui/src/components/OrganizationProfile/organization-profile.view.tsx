import type { ReactNode, RefObject } from 'react';

import { ORGANIZATION_PROFILE_CARD_SCROLLBOX_ID } from '@/constants';
import { OrganizationProfileContext, SubscriberTypeContext } from '@/contexts';
import { Flow, localizationKeys } from '@/customizables';
import { NavbarMenuButtonRow } from '@/elements/Navbar';
import { ProfileCard } from '@/elements/ProfileCard';
import { Route, Switch } from '@/router';
import type { OrganizationProfileCtx } from '@/types';

import { OrganizationProfileNavbar } from './OrganizationProfileNavbar';
import { OrganizationProfileRoutes } from './OrganizationProfileRoutes';

export const OrganizationProfileView = ({ children }: { children: ReactNode }) => (
  <Flow.Root flow='organizationProfile'>
    <Flow.Part>
      <Switch>
        <Route>
          <SubscriberTypeContext.Provider value='organization'>{children}</SubscriberTypeContext.Provider>
        </Route>
      </Switch>
    </Flow.Part>
  </Flow.Root>
);

export const OrganizationProfileRoutesView = ({ contentRef }: { contentRef: RefObject<HTMLDivElement> }) => (
  <ProfileCard.Root
    sx={t => ({ display: 'grid', gridTemplateColumns: '1fr 3fr', height: t.sizes.$176, overflow: 'hidden' })}
  >
    <OrganizationProfileNavbar contentRef={contentRef}>
      <NavbarMenuButtonRow navbarTitleLocalizationKey={localizationKeys('organizationProfile.navbar.title')} />
      <ProfileCard.Content
        contentRef={contentRef}
        scrollBoxId={ORGANIZATION_PROFILE_CARD_SCROLLBOX_ID}
      >
        <OrganizationProfileRoutes contentRef={contentRef} />
      </ProfileCard.Content>
    </OrganizationProfileNavbar>
  </ProfileCard.Root>
);

export const OrganizationProfileModalView = ({
  profileProps,
  children,
}: {
  profileProps: OrganizationProfileCtx;
  children: ReactNode;
}) => (
  <Route path='organizationProfile'>
    <OrganizationProfileContext.Provider value={profileProps}>
      {/*TODO: Used by InvisibleRootBox, can we simplify? */}
      <div>{children}</div>
    </OrganizationProfileContext.Provider>
  </Route>
);
