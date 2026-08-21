import { UserProfileMfaSectionView } from '@clerk/ui/mosaic/user-profile/user-profile-mfa-section.view';
import { useState } from 'react';

import type { StoryMeta } from '@/lib/types';

import { useMfaSectionFlow } from './user-profile-mfa-section-flow.harness';
import { MfaSectionFlowDialogs } from './user-profile-security-section-flow-dialogs';
import { DEFAULT_SECURITY_FLOW_CONFIG } from './user-profile-security-flow.config';
import { SecurityFlowStates } from './user-profile-security-flows.stories';

export { default as __source } from './user-profile-mfa-section-flow.stories?raw';

export const meta: StoryMeta = {
  group: 'User Profile',
  title: 'UserProfileMfaSectionFlow',
  label: 'MFA',
  layout: 'wide',
  navigation: { category: 'Flows' },
  source: 'packages/ui/src/mosaic/user-profile/user-profile-mfa-dialog.view.tsx',
};

export function Default() {
  const [config, setConfig] = useState(DEFAULT_SECURITY_FLOW_CONFIG);
  const flow = useMfaSectionFlow({
    config,
    onBackupCodesChange: hasBackupCodes => setConfig(current => ({ ...current, hasBackupCodes })),
    onMfaMethodChange: (method, enabled) =>
      setConfig(current => ({
        ...current,
        ...(method === 'sms' ? { hasMfaPhone: enabled } : { hasMfaAuthenticator: enabled }),
      })),
  });

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
      <UserProfileMfaSectionView
        methods={flow.mfaMethods}
        onAdd={flow.openAddMfa}
        onRegenerateBackupCodes={flow.openBackupCodes}
        onRemove={flow.openRemoveMfa}
      />
      <MfaSectionFlowDialogs flow={flow} />
    </div>
  );
}

export function States() {
  return <SecurityFlowStates flows={['add-mfa', 'remove-mfa', 'backup-codes']} />;
}

const storyColumn = { display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '100%' } as const;
const controls = { alignItems: 'center', display: 'flex', fontSize: '0.8125rem', gap: '0.375rem' } as const;
