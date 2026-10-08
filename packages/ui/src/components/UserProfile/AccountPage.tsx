import { withCardStateProvider } from '@/ui/elements/contexts';

import {
  AccountConnectedAccounts,
  AccountEmails,
  AccountEnterpriseAccounts,
  AccountPhone,
  AccountUsername,
  AccountWeb3,
} from './AccountSections';
import { useUserProfilePageController } from './profile-page.controller';
import { useUserProfilePageModel } from './profile-page.model';
import { UserProfilePageView } from './profile-page.view';
import { UserProfileSection } from './UserProfileSection';

export const AccountPage = withCardStateProvider(() => {
  const model = useUserProfilePageModel('account');
  const controller = useUserProfilePageController(model);
  return (
    <UserProfilePageView {...controller}>
      <UserProfileSection />
      <AccountUsername />
      <AccountEmails />
      <AccountPhone />
      <AccountConnectedAccounts />
      <AccountEnterpriseAccounts />
      <AccountWeb3 />
    </UserProfilePageView>
  );
});
