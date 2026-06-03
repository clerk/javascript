import type { PropsWithChildren, ReactNode } from 'react';

import { CardStateProvider, useCardState } from '@/ui/elements/contexts';
import { ProfileCard } from '@/ui/elements/ProfileCard';

import { localizationKeys } from '../../customizables';
import { AccountPage } from '../../components/UserProfile/AccountPage';
import { PageContext } from '../PageContext';

function AccountComposed({ children }: PropsWithChildren): ReactNode {
  const card = useCardState();
  return (
    <ProfileCard.Page>
      <ProfileCard.PageSection
        pageId='account'
        titleKey={localizationKeys('userProfile.start.headerTitle__account')}
        alertContent={card.error}
        outerSx={t => ({ gap: t.space.$8, color: t.colors.$colorForeground, isolation: 'isolate' })}
      >
        {children}
      </ProfileCard.PageSection>
    </ProfileCard.Page>
  );
}

export function Account({ children }: PropsWithChildren): ReactNode {
  if (!children) {
    return <AccountPage />;
  }

  return (
    <PageContext.Provider value='account'>
      <CardStateProvider>
        <AccountComposed>{children}</AccountComposed>
      </CardStateProvider>
    </PageContext.Provider>
  );
}
