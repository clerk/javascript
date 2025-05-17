import { useOrganization } from '@clerk/shared/react';

import { ApiKeysContext } from '../../contexts';
import { Col, localizationKeys } from '../../customizables';
import { Header } from '../../elements';
import { ApiKeysInternal } from '../ApiKeys';

export const OrganizationApiKeysPage = () => {
  const { organization } = useOrganization();

  return (
    <Col gap={4}>
      <Header.Root>
        <Header.Title
          localizationKey={localizationKeys('organizationProfile.apiKeysPage.title')}
          textVariant='h2'
        />
      </Header.Root>
      <ApiKeysContext.Provider value={{ componentName: 'ApiKeys' }}>
        <ApiKeysInternal subject={organization?.id ?? ''} />
      </ApiKeysContext.Provider>
    </Col>
  );
};
