import { useOrganization } from '@clerk/shared/react';

import { ApiKeysContext, useApiKeysContext } from '../../contexts';
import { Col } from '../../customizables';
import { Header } from '../../elements';
import { ApiKeysInternal, CopyButton } from '../ApiKeys';
import { useApiKeys } from '../ApiKeys/shared';

function APIKeysPageInternal() {
  const ctx = useApiKeysContext();
  const { organization } = useOrganization();
  const apiKeys = useApiKeys(organization?.id ?? '', ctx.perPage);
  return (
    <ApiKeysContext.Provider value={{ componentName: 'ApiKeys' }}>
      <ApiKeysInternal
        {...apiKeys}
        CopyButton={CopyButton}
      />
    </ApiKeysContext.Provider>
  );
}

export const OrganizationApiKeysPage = () => {
  return (
    <Col gap={4}>
      <Header.Root>
        {/* TODO: Add localization key */}
        <Header.Title
          localizationKey='API Keys'
          textVariant='h2'
        />
      </Header.Root>
      <ApiKeysContext.Provider value={{ componentName: 'ApiKeys' }}>
        <APIKeysPageInternal />
      </ApiKeysContext.Provider>
    </Col>
  );
};
