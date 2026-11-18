'use client';

import type { PropsWithChildren, ReactNode } from 'react';

import { CardStateProvider, useCardState } from '@/ui/elements/contexts';
import { ProfileCard } from '@/ui/elements/ProfileCard';

import { SecurityPage } from '../../components/UserProfile/SecurityPage';
import { localizationKeys } from '../../customizables';
import { PageContext } from '../PageContext';

function SecurityComposed({ children }: PropsWithChildren): ReactNode {
  const card = useCardState();
  return (
    <ProfileCard.Page>
      <ProfileCard.PagePanel
        pageId='security'
        titleKey={localizationKeys('userProfile.start.headerTitle__security')}
        alertContent={card.error}
      >
        {children}
      </ProfileCard.PagePanel>
    </ProfileCard.Page>
  );
}

export function UserProfileSecurityPanel({ children }: PropsWithChildren): ReactNode {
  if (!children) {
    return <SecurityPage />;
  }

  return (
    <PageContext.Provider value='security'>
      <CardStateProvider>
        <SecurityComposed>{children}</SecurityComposed>
      </CardStateProvider>
    </PageContext.Provider>
  );
}
