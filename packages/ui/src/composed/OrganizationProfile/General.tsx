'use client';

import type { PropsWithChildren, ReactNode } from 'react';

import { CardStateProvider, useCardState } from '@/ui/elements/contexts';
import { ProfileCard } from '@/ui/elements/ProfileCard';

import { OrganizationGeneralPage } from '../../components/OrganizationProfile/OrganizationGeneralPage';
import { localizationKeys } from '../../customizables';
import { PageContext } from '../PageContext';

function GeneralComposed({ children }: PropsWithChildren): ReactNode {
  const card = useCardState();
  return (
    <ProfileCard.Page>
      <ProfileCard.PagePanel
        pageId='organizationGeneral'
        titleKey={localizationKeys('organizationProfile.start.headerTitle__general')}
        alertContent={card.error}
      >
        {children}
      </ProfileCard.PagePanel>
    </ProfileCard.Page>
  );
}

export function OrganizationProfileGeneralPanel({ children }: PropsWithChildren): ReactNode {
  if (!children) {
    // Unlike AccountPage/SecurityPage, OrganizationGeneralPage does not self-wrap in a
    // CardStateProvider. Mounted <OrganizationProfile /> supplies one at its root, so the
    // leave/delete confirmation forms (useLeaveWithRevalidations -> useCardState) resolve it.
    // The composed panel is a standalone entry point, so it must provide the same root here.
    return (
      <CardStateProvider>
        <OrganizationGeneralPage />
      </CardStateProvider>
    );
  }

  // The section confirmation forms (leave/delete) call useCardState(), so children must be wrapped
  // in a CardStateProvider — mirroring the UserProfile Account/Security composed panels.
  return (
    <PageContext.Provider value='general'>
      <CardStateProvider>
        <GeneralComposed>{children}</GeneralComposed>
      </CardStateProvider>
    </PageContext.Provider>
  );
}
