import { useOrganization } from '@clerk/shared/react';

import { APIKeysContext, useOrganizationProfileContext } from '@/ui/contexts';
import { Col, localizationKeys } from '@/ui/customizables';
import { Header } from '@/ui/elements/Header';
import { useUnsafeNavbarContext } from '@/ui/elements/Navbar';

import { APIKeysPage } from '../APIKeys/APIKeys';

export const OrganizationAPIKeysPage = () => {
  const { organization } = useOrganization();
  const { contentRef } = useUnsafeNavbarContext();
  const { apiKeysProps } = useOrganizationProfileContext();

  if (!organization) {
    // We should never reach this point, but we'll return null to make TS happy
    return null;
  }

  return (
    <Col gap={4}>
      <Header.Root>
        <Header.Title
          localizationKey={localizationKeys('organizationProfile.apiKeysPage.title')}
          textVariant='h2'
        />
      </Header.Root>
      <APIKeysContext.Provider value={{ ...apiKeysProps, componentName: 'APIKeys', subject: organization.id }}>
        <APIKeysPage
          subject={organization.id}
          revokeModalRoot={contentRef}
        />
      </APIKeysContext.Provider>
    </Col>
  );
};
