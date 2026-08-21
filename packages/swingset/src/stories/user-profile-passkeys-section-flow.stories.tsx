import { UserProfilePasskeysSectionView } from '@clerk/ui/mosaic/user-profile/user-profile-passkeys-section.view';
import { useState } from 'react';

import type { StoryMeta } from '@/lib/types';

import { usePasskeysSectionFlow } from './user-profile-passkeys-section-flow.harness';
import { PasskeysSectionFlowDialogs } from './user-profile-security-section-flow-dialogs';
import { DEFAULT_SECURITY_FLOW_CONFIG } from './user-profile-security-flow.config';
import { SecurityFlowStates } from './user-profile-security-flows.stories';

export { default as __source } from './user-profile-passkeys-section-flow.stories?raw';

export const meta: StoryMeta = {
  group: 'User Profile',
  title: 'UserProfilePasskeysSectionFlow',
  label: 'Passkeys',
  layout: 'wide',
  navigation: { category: 'Flows' },
  source: 'packages/ui/src/mosaic/user-profile/user-profile-passkey-dialog.view.tsx',
};

export function Default() {
  const [config, setConfig] = useState(DEFAULT_SECURITY_FLOW_CONFIG);
  const flow = usePasskeysSectionFlow({
    config,
    onHasPasskeyChange: hasPasskey => setConfig(current => ({ ...current, hasPasskey })),
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
      <label style={controls}>
        Capability
        <select
          value={config.passkeyCapability}
          onChange={event =>
            setConfig(current => ({
              ...current,
              passkeyCapability: event.target.value as typeof current.passkeyCapability,
            }))
          }
        >
          <option value='available'>Available</option>
          <option value='unsupported'>Unsupported</option>
        </select>
      </label>
      <label style={controls}>
        Creation result
        <select
          value={config.passkeyCreationResult}
          onChange={event =>
            setConfig(current => ({
              ...current,
              passkeyCreationResult: event.target.value as typeof current.passkeyCreationResult,
            }))
          }
        >
          <option value='success'>Success</option>
          <option value='cancelled'>Cancelled</option>
          <option value='resource-error'>Resource error</option>
        </select>
      </label>
      <UserProfilePasskeysSectionView
        passkeys={flow.passkeys}
        onAdd={flow.openAddPasskey}
        onManage={flow.openRenamePasskey}
        onRemove={flow.openRemovePasskey}
      />
      <PasskeysSectionFlowDialogs flow={flow} />
    </div>
  );
}

export function States() {
  return <SecurityFlowStates flows={['add-passkey', 'rename-passkey', 'remove-passkey']} />;
}

const storyColumn = { display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '100%' } as const;
const controls = { alignItems: 'center', display: 'flex', fontSize: '0.8125rem', gap: '0.375rem' } as const;
