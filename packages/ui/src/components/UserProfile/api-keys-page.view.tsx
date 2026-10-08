import { APIKeysContext } from '@/ui/contexts';
import { Col, descriptors, localizationKeys } from '@/ui/customizables';
import { Header } from '@/ui/elements/Header';
import { ProfileCard } from '@/ui/elements/ProfileCard';

import type { APIKeysProfileData } from '../APIKeys/api-keys.types';
import { APIKeysPage as APIKeysPageInternal } from '../APIKeys/APIKeys';

export const UserAPIKeysPageView = ({ data }: { data: APIKeysProfileData }) => (
  <ProfileCard.Page>
    <Col
      gap={4}
      elementDescriptor={descriptors.page}
      sx={{ isolation: 'isolate' }}
    >
      <Header.Root>
        <Header.Title
          localizationKey={localizationKeys('userProfile.apiKeysPage.title')}
          textVariant='h2'
        />
      </Header.Root>
      <APIKeysContext.Provider value={{ componentName: 'APIKeys', ...data.apiKeysProps }}>
        <APIKeysPageInternal
          subject={data.subject}
          revokeModalRoot={data.revokeModalRoot}
        />
      </APIKeysContext.Provider>
    </Col>
  </ProfileCard.Page>
);
