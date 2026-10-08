import { withCardStateProvider } from '@/ui/elements/contexts';

import { ActiveDevicesSection } from './ActiveDevicesSection';
import { useUserProfilePageController } from './profile-page.controller';
import { useUserProfilePageModel } from './profile-page.model';
import { UserProfilePageView } from './profile-page.view';
import { SecurityDelete, SecurityMfa, SecurityPasskeys, SecurityPassword } from './SecuritySections';

export const SecurityPage = withCardStateProvider(() => {
  const model = useUserProfilePageModel('security');
  const controller = useUserProfilePageController(model);
  return (
    <UserProfilePageView {...controller}>
      <SecurityPassword />
      <SecurityPasskeys />
      <SecurityMfa />
      <ActiveDevicesSection />
      <SecurityDelete />
    </UserProfilePageView>
  );
});
