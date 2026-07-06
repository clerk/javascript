'use client';

import type { PropsWithChildren, ReactNode } from 'react';

import { ProfileCard } from '@/ui/elements/ProfileCard';

import { OrganizationGeneralPage } from '../../components/OrganizationProfile/OrganizationGeneralPage';
import { localizationKeys } from '../../customizables';
import { PageContext } from '../PageContext';

export function OrganizationProfileGeneralPanel({ children }: PropsWithChildren): ReactNode {
  if (!children) {
    return <OrganizationGeneralPage />;
  }

  return (
    <PageContext.Provider value='general'>
      <ProfileCard.Page>
        <ProfileCard.PageSection
          pageId='organizationGeneral'
          titleKey={localizationKeys('organizationProfile.start.headerTitle__general')}
        >
          {children}
        </ProfileCard.PageSection>
      </ProfileCard.Page>
    </PageContext.Provider>
  );
}
