import { useOrganization } from '@clerk/shared/react';

import { Col, localizationKeys } from '@/ui/customizables';
import { Header } from '@/ui/elements/Header';

export const OrganizationSelfServeSsoPage = () => {
  const { organization } = useOrganization();

  if (!organization) {
    // We should never reach this point, but we'll return null to make TS happy
    return null;
  }

  return (
    <Col gap={4}>
      <Header.Root>
        <Header.Title
          title={localizationKeys('organizationProfile.selfServeSsoPage.title')}
          textVariant='h2'
        />
      </Header.Root>
    </Col>
  );
};
