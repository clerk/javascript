import { useCardState, withCardStateProvider } from '@/ui/elements/contexts';
import { ProfileCard } from '@/ui/elements/ProfileCard';

import { localizationKeys } from '../../customizables';
import {
  AccountUsername,
  AccountEmails,
  AccountPhone,
  AccountConnectedAccounts,
  AccountEnterpriseAccounts,
  AccountWeb3,
} from './AccountSections';
import { UserProfileSection } from './UserProfileSection';

export const AccountPage = withCardStateProvider(() => {
  const card = useCardState();

  return (
    <ProfileCard.Page>
      <ProfileCard.PageSection
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
        <AccountEnterpriseAccounts />
        <AccountWeb3 />
      </ProfileCard.PageSection>
    </ProfileCard.Page>
  );
});
