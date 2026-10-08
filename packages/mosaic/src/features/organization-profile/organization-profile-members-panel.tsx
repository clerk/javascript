import type { ReactNode } from 'react';

import { useMembersTableController, useMembersTableSearchController } from './members-table-tab.controller';
import { useMembersTableAccessModel, useMembersTableModel } from './members-table-tab.model';
import { OrganizationProfileMembersPanelView } from './organization-profile-members-panel.view';

export function OrganizationProfileMembersPanel({ fallback }: { fallback?: ReactNode }) {
  const access = useMembersTableAccessModel();
  if (access.status === 'loading') {
    return fallback ?? null;
  }
  if (access.status === 'hidden') {
    return null;
  }
  return <ConnectedMembersPanel key={`${access.organizationId}:${access.sessionId}`} />;
}

function ConnectedMembersPanel() {
  const search = useMembersTableSearchController();
  const model = useMembersTableModel(search.query);
  const members = useMembersTableController(model);
  return <OrganizationProfileMembersPanelView members={{ ...members, ...search }} />;
}
