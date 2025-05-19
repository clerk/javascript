import { useUser } from '@clerk/shared/react';

import { ApiKeysContext } from '../../contexts';
import { Col, localizationKeys } from '../../customizables';
import { Header } from '../../elements';
import { APIKeysPage as APIKeysPageInternal } from '../ApiKeys';

export const APIKeysPage = () => {
  const { user } = useUser();

  return (
    <Col gap={4}>
      <Header.Root>
        <Header.Title
          localizationKey={localizationKeys('userProfile.apiKeysPage.title')}
          textVariant='h2'
        />
      </Header.Root>
      <ApiKeysContext.Provider value={{ componentName: 'APIKeys' }}>
        <APIKeysPageInternal subject={user?.id ?? ''} />
      </ApiKeysContext.Provider>
    </Col>
  );
};
