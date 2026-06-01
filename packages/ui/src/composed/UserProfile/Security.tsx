import type { PropsWithChildren, ReactNode } from 'react';

import { Card } from '@/ui/elements/Card';
import { CardStateProvider, useCardState } from '@/ui/elements/contexts';
import { Header } from '@/ui/elements/Header';
import { ProfileCard } from '@/ui/elements/ProfileCard';

import { Col, descriptors, localizationKeys } from '../../customizables';
import { SecurityPage } from '../../components/UserProfile/SecurityPage';
import { PageContext } from '../PageContext';

function SecurityChrome({ children }: PropsWithChildren): ReactNode {
  const card = useCardState();
  return (
    <ProfileCard.Page>
      <Col
        elementDescriptor={descriptors.page}
        sx={t => ({ gap: t.space.$8, isolation: 'isolate' })}
      >
        <Col
          elementDescriptor={descriptors.profilePage}
          elementId={descriptors.profilePage.setId('security')}
        >
          <Header.Root>
            <Header.Title
              localizationKey={localizationKeys('userProfile.start.headerTitle__security')}
              sx={t => ({ marginBottom: t.space.$4 })}
              textVariant='h2'
            />
          </Header.Root>
          <Card.Alert>{card.error}</Card.Alert>
          {children}
        </Col>
      </Col>
    </ProfileCard.Page>
  );
}

export function Security({ children }: PropsWithChildren): ReactNode {
  if (!children) {
    return <SecurityPage />;
  }

  return (
    <PageContext.Provider value='security'>
      <CardStateProvider>
        <SecurityChrome>{children}</SecurityChrome>
      </CardStateProvider>
    </PageContext.Provider>
  );
}
