import { UserProfileDeleteSectionView } from '@clerk/ui/mosaic/user-profile/user-profile-delete-section.view';
import { useState } from 'react';

import type { StoryMeta } from '@/lib/types';

import { useDeleteSectionFlow } from './user-profile-delete-section-flow.harness';
import { DeleteSectionFlowDialogs } from './user-profile-security-section-flow-dialogs';
import { DEFAULT_SECURITY_FLOW_CONFIG } from './user-profile-security-flow.config';
import { SecurityFlowStates } from './user-profile-security-flows.stories';

export { default as __source } from './user-profile-delete-section-flow.stories?raw';

export const meta: StoryMeta = {
  group: 'User Profile',
  title: 'UserProfileDeleteSectionFlow',
  label: 'Delete account',
  layout: 'wide',
  navigation: { category: 'Flows' },
  source: 'packages/ui/src/mosaic/user-profile/user-profile-delete-account-dialog.view.tsx',
};

export function Default() {
  const [config, setConfig] = useState(DEFAULT_SECURITY_FLOW_CONFIG);
  const flow = useDeleteSectionFlow({ config });

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
      <UserProfileDeleteSectionView onDelete={flow.openDeleteAccount} />
      <DeleteSectionFlowDialogs flow={flow} />
    </div>
  );
}

export function States() {
  return <SecurityFlowStates flows={['delete-account']} />;
}

const storyColumn = { display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '100%' } as const;
const controls = { alignItems: 'center', display: 'flex', fontSize: '0.8125rem', gap: '0.375rem' } as const;
