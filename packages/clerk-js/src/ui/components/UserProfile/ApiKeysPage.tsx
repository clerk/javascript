import { useUser } from '@clerk/shared/react';

import { APIKeysContext, useUserProfileContext } from '@/ui/contexts';
import { Col, descriptors, localizationKeys } from '@/ui/customizables';
import { Header } from '@/ui/elements/Header';
import { useUnsafeNavbarContext } from '@/ui/elements/Navbar';

import { APIKeysPage as APIKeysPageInternal } from '../ApiKeys/ApiKeys';

export const APIKeysPage = () => {
  const { user } = useUser();
  const { contentRef } = useUnsafeNavbarContext();
  const { apiKeysProps } = useUserProfileContext();

  if (!user) {
    // We should never reach this point, but we'll return null to make TS happy
    return null;
  }

  return (
    <Col
      gap={4}
      elementDescriptor={descriptors.page}
    >
      <Header.Root>
        <Header.Title
          localizationKey={localizationKeys('userProfile.apiKeysPage.title')}
          textVariant='h2'
        />
      </Header.Root>
      <APIKeysContext.Provider value={{ componentName: 'APIKeys', ...apiKeysProps }}>
        <APIKeysPageInternal
          subject={user.id}
          revokeModalRoot={contentRef}
        />
      </APIKeysContext.Provider>
    </Col>
  );
};
