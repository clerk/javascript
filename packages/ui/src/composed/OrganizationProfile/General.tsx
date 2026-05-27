import type { PropsWithChildren, ReactNode } from 'react';

import { Header } from '@/ui/elements/Header';
import { ProfileCard } from '@/ui/elements/ProfileCard';

import { Col, descriptors, localizationKeys } from '../../customizables';
import { OrganizationGeneralPage } from '../../components/OrganizationProfile/OrganizationGeneralPage';
import { PageContext } from '../PageContext';

export function General({ children }: PropsWithChildren): ReactNode {
  if (!children) {
    return <OrganizationGeneralPage />;
  }

  return (
    <PageContext.Provider value='general'>
      <ProfileCard.Page>
        <Col
          elementDescriptor={descriptors.page}
          sx={t => ({ gap: t.space.$8, isolation: 'isolate' })}
        >
          <Col
            elementDescriptor={descriptors.profilePage}
            elementId={descriptors.profilePage.setId('organizationGeneral')}
          >
            <Header.Root>
              <Header.Title
                localizationKey={localizationKeys('organizationProfile.start.headerTitle__general')}
                sx={t => ({ marginBottom: t.space.$4 })}
                textVariant='h2'
              />
            </Header.Root>
            {children}
          </Col>
        </Col>
      </ProfileCard.Page>
    </PageContext.Provider>
  );
}
