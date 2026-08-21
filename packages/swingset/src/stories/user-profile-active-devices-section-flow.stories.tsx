import { UserProfileActiveDevicesSectionView } from '@clerk/ui/mosaic/user-profile/user-profile-active-devices-section.view';
import type { UserProfileDevice } from '@clerk/ui/mosaic/user-profile/user-profile-security-panel.view';
import { useState } from 'react';

import type { StoryMeta } from '@/lib/types';

import { useActiveDevicesSectionFlow } from './user-profile-active-devices-section-flow.harness';
import { ActiveDevicesSectionFlowDialogs } from './user-profile-security-section-flow-dialogs';
import { DEFAULT_SECURITY_FLOW_CONFIG } from './user-profile-security-flow.config';
import { SecurityFlowStates } from './user-profile-security-flows.stories';

export { default as __source } from './user-profile-active-devices-section-flow.stories?raw';

export const meta: StoryMeta = {
  group: 'User Profile',
  title: 'UserProfileActiveDevicesSectionFlow',
  label: 'Active devices',
  layout: 'wide',
  navigation: { category: 'Flows' },
  source: 'packages/ui/src/mosaic/user-profile/user-profile-device-dialog.view.tsx',
};

const DEVICES: UserProfileDevice[] = [
  { id: 'current', name: 'Safari on macOS', type: 'desktop', isCurrent: true, relationship: 'current' },
  {
    id: 'desktop',
    name: 'Chrome on macOS',
    description: 'Last active 4 days ago',
    type: 'desktop',
    relationship: 'other',
    details: {
      title: 'Macbook Pro · Chrome',
      lastActiveAtLabel: 'Last active 4 days ago',
      deviceName: 'Macbook Pro',
      browserName: 'Chrome 150.0.0.0',
      ipAddress: '2600:100e:b10b:787b:e8ae:6e75:fc2f:b10',
      location: 'Salt Lake City, UT, United States',
      locationFlag: '🇺🇸',
      originalSignInAtLabel: 'July 5th, 2026',
    },
  },
];

export function Default() {
  const [config, setConfig] = useState(DEFAULT_SECURITY_FLOW_CONFIG);
  const flow = useActiveDevicesSectionFlow({ config, initialDevices: DEVICES });

  return (
    <div style={storyColumn}>
      <label style={controls}>
        <input
          checked={config.requireReverification}
          type='checkbox'
          onChange={event => setConfig(current => ({ ...current, requireReverification: event.target.checked }))}
        />
        Require reverification
      </label>
      <UserProfileActiveDevicesSectionView
        devices={flow.devices}
        onManageDevice={flow.openDevice}
        onSignOutDevice={flow.openSignOutDevice}
        onSignOutAllOtherDevices={flow.openSignOutAllDevices}
      />
      <ActiveDevicesSectionFlowDialogs flow={flow} />
    </div>
  );
}

export function States() {
  return <SecurityFlowStates flows={['device', 'sign-out-all-devices']} />;
}

export function ProfileStates() {
  return (
    <div style={storyColumn}>
      <UserProfileActiveDevicesSectionView
        devices={[]}
        status='loading'
      />
      <UserProfileActiveDevicesSectionView
        devices={[]}
        status='error'
        error='Could not load active devices.'
      />
      <UserProfileActiveDevicesSectionView
        devices={[
          {
            id: 'current-actor',
            name: 'Safari on macOS',
            type: 'desktop',
            isCurrent: true,
            relationship: 'current-impersonating',
            status: 'active',
          },
          {
            id: 'user',
            name: 'Chrome on macOS',
            type: 'desktop',
            relationship: 'user-device',
            status: 'pending',
          },
          {
            id: 'other-actor',
            name: 'Firefox on Windows',
            type: 'desktop',
            relationship: 'other-impersonator',
            status: 'active',
            isRevoking: true,
          },
          { id: 'ended', name: 'Ended mobile session', type: 'mobile', status: 'ended' },
        ]}
        onManageDevice={() => undefined}
        onSignOutDevice={() => undefined}
      />
    </div>
  );
}

const storyColumn = { display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '100%' } as const;
const controls = { alignItems: 'center', display: 'flex', fontSize: '0.8125rem', gap: '0.375rem' } as const;
