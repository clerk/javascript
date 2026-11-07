import { useCardState, withCardStateProvider } from '@/ui/elements/contexts';
import { ProfileCard } from '@/ui/elements/ProfileCard';

import { localizationKeys } from '../../customizables';
import {
  AccountConnectedAccounts,
  AccountConnections,
  AccountEmails,
  AccountEnterpriseAccounts,
  AccountPhone,
  AccountUsername,
  AccountWeb3,
} from './AccountSections';
import { UserProfileSection } from './UserProfileSection';

export const AccountPage = withCardStateProvider(() => {
  const card = useCardState();

  return (
    <ProfileCard.Page>
      <ProfileCard.PagePanel
        pageId='account'
        titleKey={localizationKeys('userProfile.start.headerTitle__account')}
        alertContent={card.error}
        outerSx={t => ({ gap: t.space.$8, color: t.colors.$colorForeground, isolation: 'isolate' })}
      >
        <UserProfileSection />
        <AccountUsername />
        <AccountEmails />
        <AccountPhone />
        <AccountConnectedAccounts />
        <AccountConnections />
        <AccountEnterpriseAccounts />
        <AccountWeb3 />
      </ProfileCard.PagePanel>
    </ProfileCard.Page>
  );
});
