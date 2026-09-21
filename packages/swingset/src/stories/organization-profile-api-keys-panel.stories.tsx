import { OrganizationProfileApiKeysPanelView } from '@clerk/mosaic/features/organization-profile/organization-profile-api-keys-panel.view';
import { useMessages } from '@clerk/mosaic/localization';
import { useRef } from 'react';

import type { StoryMeta } from '@/lib/types';

import {
  createExampleAPIKey,
  revokeExampleAPIKey,
  useOrganizationProfileAPIKeysFixture,
} from './fixtures/organization-profile-api-keys';

export { default as __source } from './organization-profile-api-keys-panel.stories?raw';

export const meta: StoryMeta = {
  group: 'Organization Profile',
  status: 'wip',
  substatus: 'needs wire-up',
  title: 'OrganizationProfileApiKeysPanel',
  label: 'API keys panel',
  navigation: { category: 'Panels' },
  source: 'packages/mosaic/src/features/organization-profile/organization-profile-api-keys-panel.view.tsx',
};

export function Default() {
  const props = useOrganizationProfileAPIKeysFixture();
  return <OrganizationProfileApiKeysPanelView {...props} />;
}

export function Retry() {
  const m = useMessages('organizationProfileApiKeysPanel');
  const attempts = useRef({ create: false, copy: false, revoke: false });
  const props = useOrganizationProfileAPIKeysFixture({
    createKey: async () => {
      const result = await createExampleAPIKey();
      if (!attempts.current.create) {
        attempts.current.create = true;
        throw new Error(m.createError);
      }
      return result;
    },
    copyKey: async secret => {
      if (!attempts.current.copy) {
        attempts.current.copy = true;
        throw new Error(m.copyError);
      }
      await navigator.clipboard.writeText(secret);
    },
    revokeKey: async () => {
      await revokeExampleAPIKey();
      if (!attempts.current.revoke) {
        attempts.current.revoke = true;
        throw new Error(m.revokeError);
      }
    },
  });
  return <OrganizationProfileApiKeysPanelView {...props} />;
}

export function ReadOnly() {
  const props = useOrganizationProfileAPIKeysFixture();
  return (
    <OrganizationProfileApiKeysPanelView
      {...props}
      onCreate={undefined}
      createDialog={undefined}
      onRevoke={undefined}
    />
  );
}

export function Empty() {
  const props = useOrganizationProfileAPIKeysFixture({ initialKeys: [] });
  return (
    <OrganizationProfileApiKeysPanelView
      {...props}
      onCreate={undefined}
      createDialog={undefined}
      onRevoke={undefined}
    />
  );
}
