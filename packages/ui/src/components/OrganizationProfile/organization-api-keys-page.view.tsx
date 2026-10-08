import { APIKeysContext } from '@/ui/contexts';
import { Col, localizationKeys } from '@/ui/customizables';
import { Header } from '@/ui/elements/Header';
import { ProfileCard } from '@/ui/elements/ProfileCard';

import type { APIKeysProfileData } from '../APIKeys/api-keys.types';
import { APIKeysPage } from '../APIKeys/APIKeys';

export const OrganizationAPIKeysPageView = ({ data }: { data: APIKeysProfileData }) => (
  <ProfileCard.Page>
    <Col gap={4}>
      <Header.Root>
        <Header.Title
          localizationKey={localizationKeys('organizationProfile.apiKeysPage.title')}
          textVariant='h2'
        />
      </Header.Root>
      <APIKeysContext.Provider value={{ ...data.apiKeysProps, componentName: 'APIKeys' }}>
        <APIKeysPage
          subject={data.subject}
          revokeModalRoot={data.revokeModalRoot}
        />
      </APIKeysContext.Provider>
    </Col>
  </ProfileCard.Page>
);
