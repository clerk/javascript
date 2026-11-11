'use client';
import { Panel } from '@clerk/mosaic/components/panel';
import { Tabs } from '@clerk/mosaic/components/tabs';
import { APIKeysTableView } from '@clerk/mosaic/features/api-keys/api-keys-table.view';
import { UserProfileActiveDevicesSectionView } from '@clerk/mosaic/features/user-profile/user-profile-active-devices-section/user-profile-active-devices-section.view';
import { UserProfileMfaSectionView } from '@clerk/mosaic/features/user-profile/user-profile-mfa-section/user-profile-mfa-section.view';
import { UserProfilePasswordSectionView } from '@clerk/mosaic/features/user-profile/user-profile-password-section/user-profile-password-section.view';
import { useAPIKeysTableFixture } from '@swingset/stories/fixtures/api-keys-table';
import { useUserProfileActiveDevicesFixture } from '@swingset/stories/fixtures/user-profile-active-devices';
import { useUserProfileEditPasswordFixture } from '@swingset/stories/fixtures/user-profile-edit-password';
import { useUserProfileMfaExample } from '@swingset/stories/fixtures/user-profile-mfa-example';
import { useUserProfileProfileFixture } from '@swingset/stories/fixtures/user-profile-profile';
import * as React from 'react';

import { CustomProfileCard } from '@/components/gallery/custom-profile-card';

const TABS = [
  { id: 'profile', label: 'Profile' },
  { id: 'devices', label: 'Devices' },
  { id: 'api-keys', label: 'API keys' },
];
export function TabsProfile() {
  const profile = useUserProfileProfileFixture();
  const devices = useUserProfileActiveDevicesFixture();
  const password = useUserProfileEditPasswordFixture();
  const mfa = useUserProfileMfaExample();
  const apiKeys = useAPIKeysTableFixture();
  return (
    <Panel.Root>
      <Panel.Title>Account</Panel.Title>
      <Tabs.Root defaultValue='profile'>
        <div className='sticky top-0 z-10 bg-[var(--cl-color-page,#fff)]'>
          <Tabs.List aria-label='Account'>
            {TABS.map(tab => (
              <Tabs.Tab
                key={tab.id}
                value={tab.id}
              >
                {tab.label}
              </Tabs.Tab>
            ))}
          </Tabs.List>
        </div>
        <Tabs.Panel value='profile'>
          <Panel.Sections>
            <CustomProfileCard
              firstName={profile.name.split(' ')[0]}
              lastName={profile.name.split(' ').slice(1).join(' ')}
              imageUrl={profile.imageUrl}
              initialEmail='preston@acme.com'
            />
            <div className='flex flex-col gap-1 pt-6'>
              <h3 className='text-xl font-semibold tracking-[-0.01em]'>Security</h3>
              <p className='text-sm text-neutral-600 dark:text-neutral-400'>
                Keep your account protected with a strong password and a second step at sign-in.
              </p>
            </div>
            <UserProfilePasswordSectionView {...password} />
            <UserProfileMfaSectionView {...mfa.section} />
          </Panel.Sections>
        </Tabs.Panel>
        <Tabs.Panel value='devices'>
          <UserProfileActiveDevicesSectionView {...devices} />
        </Tabs.Panel>
        <Tabs.Panel value='api-keys'>
          <APIKeysTableView {...apiKeys} />
        </Tabs.Panel>
      </Tabs.Root>
    </Panel.Root>
  );
}
