import type { ReactElement } from 'react';

import { useOrganizationProfileApiKeysPanelController } from './organization-profile-api-keys-panel.controller';
import { OrganizationProfileApiKeysPanelView } from './organization-profile-api-keys-panel.view';

interface OrganizationProfileApiKeysPanelProps {
  /** Items per page for the keys list. Defaults to 10. */
  perPage?: number;
  /** Whether the create form exposes the optional description field. Defaults to false. */
  showDescription?: boolean;
}

export function OrganizationProfileApiKeysPanel(props: OrganizationProfileApiKeysPanelProps = {}): ReactElement | null {
  const controller = useOrganizationProfileApiKeysPanelController(props);
  if (controller.status !== 'ready') {
    return null;
  }
  return (
    <OrganizationProfileApiKeysPanelView
      list={controller.list}
      canManage={controller.canManage}
      create={controller.create}
      revoke={controller.revoke}
    />
  );
}
