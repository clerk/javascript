import { useOrganization } from '@clerk/shared/react';

import { ApiKeysContext } from '../../contexts';
import { Col } from '../../customizables';
import { Header } from '../../elements';
import { ApiKeysInternal } from '../ApiKeys';

export const OrganizationApiKeysPage = () => {
  const { organization } = useOrganization();

  return (
    <Col gap={4}>
      <Header.Root>
        <Header.Title
          // TODO: Add localization key
          localizationKey='API Keys'
          textVariant='h2'
        />
      </Header.Root>
      <ApiKeysContext.Provider value={{ componentName: 'ApiKeys' }}>
        <ApiKeysInternal subject={organization?.id ?? ''} />
      </ApiKeysContext.Provider>
    </Col>
  );
};
