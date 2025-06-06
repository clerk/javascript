import { useOrganization } from '@clerk/shared/react';

import { ApiKeysContext } from '@/ui/contexts';
import { Col, localizationKeys } from '@/ui/customizables';
import { Header } from '@/ui/elements/Header';
import { useUnsafeNavbarContext } from '@/ui/elements/Navbar';

import { APIKeysPage } from '../ApiKeys/ApiKeys';

export const OrganizationAPIKeysPage = () => {
  const { organization } = useOrganization();
  const { contentRef } = useUnsafeNavbarContext();

  return (
    <Col gap={4}>
      <Header.Root>
        <Header.Title
          localizationKey={localizationKeys('organizationProfile.apiKeysPage.title')}
          textVariant='h2'
        />
      </Header.Root>
      <ApiKeysContext.Provider value={{ componentName: 'APIKeys' }}>
        <APIKeysPage
          subject={organization?.id ?? ''}
          revokeModalRoot={contentRef}
        />
      </ApiKeysContext.Provider>
    </Col>
  );
};
