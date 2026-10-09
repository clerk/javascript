import { UserProfileConnectedAccountsSectionView } from '@clerk/mosaic/features/user-profile/user-profile-connected-accounts-section/user-profile-connected-accounts-section.view';
import { UserProfileEmailSectionView } from '@clerk/mosaic/features/user-profile/user-profile-email-section/user-profile-email-section.view';
import { UserProfilePhoneSectionView } from '@clerk/mosaic/features/user-profile/user-profile-phone-section/user-profile-phone-section.view';
import { UserProfileProfilePanelView } from '@clerk/mosaic/features/user-profile/user-profile-profile-panel.view';
import { UserProfileProfileSectionView } from '@clerk/mosaic/features/user-profile/user-profile-profile-section/user-profile-profile-section.view';
import { UserProfileWeb3WalletsSectionView } from '@clerk/mosaic/features/user-profile/user-profile-web3-wallets-section/user-profile-web3-wallets-section.view';
import { useRef } from 'react';

import type { StoryMeta } from '@/lib/types';

import { UserProfileDangerPreview } from './fixtures/user-profile';
import { useConnectedAccountsFixture } from './fixtures/user-profile-connected-accounts';
import { useUserProfileEmailsFixture } from './fixtures/user-profile-emails';
import { useUserProfilePhonesFixture } from './fixtures/user-profile-phones';
import { useUserProfileProfileFixture } from './fixtures/user-profile-profile';
import { useWeb3WalletsFixture } from './fixtures/user-profile-web3-wallets';

export { default as __source } from './user-profile-profile-panel.stories?raw';

export const meta: StoryMeta = {
  group: 'User Profile',
  status: 'wip',
  title: 'UserProfileProfilePanel',
  label: 'Profile panel',
  navigation: { category: 'Panels' },
  source: 'packages/mosaic/src/features/user-profile/user-profile-profile-panel.view.tsx',
};

export function Default(_args: Record<string, unknown>) {
  const titleRef = useRef<HTMLDivElement>(null);
  const connections = useConnectedAccountsFixture();
  const wallets = useWeb3WalletsFixture();
  const profile = useUserProfileProfileFixture();
  const emails = useUserProfileEmailsFixture({ username: profile.username });
  const phones = useUserProfilePhonesFixture();

  return (
    <UserProfileProfilePanelView titleRef={titleRef}>
      <UserProfileProfileSectionView {...profile} />
      <UserProfileEmailSectionView {...emails} />
      <UserProfilePhoneSectionView {...phones} />
      <UserProfileConnectedAccountsSectionView
        {...connections}
        fallbackFocus={() => titleRef.current}
      />
      <UserProfileWeb3WalletsSectionView
        {...wallets}
        fallbackFocus={() => titleRef.current}
      />
      <UserProfileDangerPreview />
    </UserProfileProfilePanelView>
  );
}
