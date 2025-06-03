import { useUser } from '@clerk/shared/react';

import { ApiKeysContext } from '@/ui/contexts';
import { Col, localizationKeys } from '@/ui/customizables';
import { Header } from '@/ui/elements/Header';
import { useUnsafeNavbarContext } from '@/ui/elements/Navbar';

import { APIKeysPage as APIKeysPageInternal } from '../ApiKeys/ApiKeys';

export const APIKeysPage = () => {
  const { user } = useUser();
  const { contentRef } = useUnsafeNavbarContext();

  return (
    <Col gap={4}>
      <Header.Root>
        <Header.Title
          localizationKey={localizationKeys('userProfile.apiKeysPage.title')}
          textVariant='h2'
        />
      </Header.Root>
      <ApiKeysContext.Provider value={{ componentName: 'APIKeys' }}>
        <APIKeysPageInternal
          subject={user?.id ?? ''}
          revokeModalRoot={contentRef}
        />
      </ApiKeysContext.Provider>
    </Col>
  );
};
