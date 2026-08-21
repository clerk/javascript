import { UserProfilePasswordSectionView } from '@clerk/ui/mosaic/user-profile/user-profile-password-section.view';
import { useState } from 'react';

import type { StoryMeta } from '@/lib/types';

import { usePasswordSectionFlow } from './user-profile-password-section-flow.harness';
import { PasswordSectionFlowDialogs } from './user-profile-security-section-flow-dialogs';
import { DEFAULT_SECURITY_FLOW_CONFIG } from './user-profile-security-flow.config';
import { SecurityFlowStates } from './user-profile-security-flows.stories';

export { default as __source } from './user-profile-password-section-flow.stories?raw';

export const meta: StoryMeta = {
  group: 'User Profile',
  title: 'UserProfilePasswordSectionFlow',
  label: 'Password',
  layout: 'wide',
  navigation: { category: 'Flows' },
  source: 'packages/ui/src/mosaic/user-profile/user-profile-password-dialog.view.tsx',
};

export function Default() {
  const [config, setConfig] = useState(DEFAULT_SECURITY_FLOW_CONFIG);
  const flow = usePasswordSectionFlow({
    config,
    onHasPasswordChange: hasPassword => setConfig(current => ({ ...current, hasPassword })),
  });

  return (
    <div style={storyColumn}>
      <FlowControls
        requireReverification={config.requireReverification}
        onChange={requireReverification => setConfig(current => ({ ...current, requireReverification }))}
      />
      <UserProfilePasswordSectionView
        hasPassword={flow.hasPassword}
        onChangePassword={flow.openPassword}
      />
      <PasswordSectionFlowDialogs flow={flow} />
    </div>
  );
}

export function States() {
  return <SecurityFlowStates flows={['password']} />;
}

function FlowControls({
  requireReverification,
  onChange,
}: {
  requireReverification: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <label style={controls}>
      <input
        checked={requireReverification}
        type='checkbox'
        onChange={event => onChange(event.target.checked)}
      />
      Require reverification
    </label>
  );
}

const storyColumn = { display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '100%' } as const;
const controls = { alignItems: 'center', display: 'flex', fontSize: '0.8125rem', gap: '0.375rem' } as const;
