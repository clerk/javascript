import type { PropsWithChildren } from 'react';

import { Card } from '@/ui/elements/Card';
import { CardStateProvider, useCardState } from '@/ui/elements/contexts';
import { Header } from '@/ui/elements/Header';
import { ProfileCard } from '@/ui/elements/ProfileCard';

import { Col, descriptors, localizationKeys } from '../../customizables';
import { AccountPage } from '../../components/UserProfile/AccountPage';
import { PageContext } from '../PageContext';

function AccountChrome({ children }: PropsWithChildren) {
  const card = useCardState();
  return (
    <ProfileCard.Page>
      <Col
        elementDescriptor={descriptors.page}
        sx={t => ({ gap: t.space.$8, color: t.colors.$colorForeground, isolation: 'isolate' })}
      >
        <Col
          elementDescriptor={descriptors.profilePage}
          elementId={descriptors.profilePage.setId('account')}
        >
          <Header.Root>
            <Header.Title
              localizationKey={localizationKeys('userProfile.start.headerTitle__account')}
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

export function Account({ children }: PropsWithChildren) {
  if (!children) {
    return <AccountPage />;
  }

  return (
    <PageContext.Provider value='account'>
      <CardStateProvider>
        <AccountChrome>{children}</AccountChrome>
      </CardStateProvider>
    </PageContext.Provider>
  );
}
