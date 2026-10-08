import type { ReactNode } from 'react';

import { DomainList } from './DomainList';
import { MembersActionsRow } from './MembersActions';
import { useOrganizationMembersTabModel } from './organization-members-tab.model';
import type { MembersTabKind } from './organization-members-tab.view';
import { OrganizationMembersTabFallbackView, OrganizationMembersTabView } from './organization-members-tab.view';

export const OrganizationMembersTab = ({ kind, list }: { kind: MembersTabKind; list: ReactNode }) => {
  const model = useOrganizationMembersTabModel();

  return (
    <OrganizationMembersTabView
      kind={kind}
      showDomainPanel={model.showDomainPanel}
      domainList={
        <DomainList
          fallback={
            <OrganizationMembersTabFallbackView
              kind={kind}
              onNavigate={() => void model.navigateToGeneralPageRoot()}
            />
          }
          verificationStatus='verified'
          enrollmentMode={kind === 'invitations' ? 'automatic_invitation' : 'automatic_suggestion'}
        />
      }
      actions={<MembersActionsRow />}
      list={list}
    />
  );
};
