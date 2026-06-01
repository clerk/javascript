import type { PropsWithChildren, ReactNode } from 'react';

import { ProfileCard } from '@/ui/elements/ProfileCard';

import { localizationKeys } from '../../customizables';
import { OrganizationGeneralPage } from '../../components/OrganizationProfile/OrganizationGeneralPage';
import { PageContext } from '../PageContext';

export function General({ children }: PropsWithChildren): ReactNode {
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
