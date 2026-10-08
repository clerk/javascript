import type React from 'react';

import { ProfileCard } from '@/ui/elements/ProfileCard';

import type { useUserProfilePageController } from './profile-page.controller';

export const UserProfilePageView = ({
  pageId,
  titleKey,
  error,
  children,
}: ReturnType<typeof useUserProfilePageController> & { children: React.ReactNode }) => (
  <ProfileCard.Page>
    <ProfileCard.PagePanel
      pageId={pageId}
      titleKey={titleKey}
      alertContent={error}
      outerSx={
        pageId === 'account'
          ? t => ({ gap: t.space.$8, color: t.colors.$colorForeground, isolation: 'isolate' })
          : undefined
      }
    >
      {children}
    </ProfileCard.PagePanel>
  </ProfileCard.Page>
);
