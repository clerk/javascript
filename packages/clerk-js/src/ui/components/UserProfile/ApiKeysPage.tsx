import { useUser } from '@clerk/shared/react';

import { ApiKeysContext } from '../../contexts';
import { Col, localizationKeys } from '../../customizables';
import { Header } from '../../elements';
import { ApiKeysInternal } from '../ApiKeys';

export const ApiKeysPage = () => {
  const { user } = useUser();

  return (
    <Col gap={4}>
      <Header.Root>
        <Header.Title
          localizationKey={localizationKeys('userProfile.apiKeysPage.title')}
          textVariant='h2'
        />
      </Header.Root>
      <ApiKeysContext.Provider value={{ componentName: 'ApiKeys' }}>
        <ApiKeysInternal subject={user?.id ?? ''} />
      </ApiKeysContext.Provider>
    </Col>
  );
};
