import { useCardState, withCardStateProvider } from '@/ui/elements/contexts';
import { ProfileCard } from '@/ui/elements/ProfileCard';

import { localizationKeys } from '../../customizables';
import { ActiveDevicesSection } from './ActiveDevicesSection';
import { SecurityPassword, SecurityPasskeys, SecurityMfa, SecurityDelete } from './SecuritySections';

export const SecurityPage = withCardStateProvider(() => {
  const card = useCardState();

  return (
    <ProfileCard.Page>
      <ProfileCard.PageSection
        pageId='security'
        titleKey={localizationKeys('userProfile.start.headerTitle__security')}
        alertContent={card.error}
      >
        <SecurityPassword />
        <SecurityPasskeys />
        <SecurityMfa />
        <ActiveDevicesSection />
        <SecurityDelete />
      </ProfileCard.PageSection>
    </ProfileCard.Page>
  );
});
