import type {
  GetDomainsParams,
  OrganizationDomainVerificationStatus,
  OrganizationEnrollmentMode,
} from '@clerk/shared/types';
import type { ReactNode } from 'react';

import { withProtect } from '@/common';
import { Action } from '@/ui/elements/Action';

import { useDomainListController, useDomainMenuController } from './domain-list.controller';
import { useDomainListModel } from './domain-list.model';
import type { DomainListModel, DomainRow } from './domain-list.types';
import { DomainListRowView, DomainListView } from './domain-list.view';

type DomainListProps = GetDomainsParams & {
  verificationStatus?: OrganizationDomainVerificationStatus;
  enrollmentMode?: OrganizationEnrollmentMode;
  fallback?: ReactNode;
};

const DomainListRowContent = ({ row, canManageDomains }: { row: DomainRow; canManageDomains: boolean }) => {
  const menu = useDomainMenuController(row.isVerificationComplete);
  return (
    <DomainListRowView
      row={row}
      menu={menu}
      canManageDomains={canManageDomains}
    />
  );
};

const DomainListRow = ({ row, canManageDomains }: { row: DomainRow; canManageDomains: boolean }) => (
  <Action.Root>
    <DomainListRowContent
      row={row}
      canManageDomains={canManageDomains}
    />
  </Action.Root>
);

export const DomainList = withProtect(
  (props: DomainListProps) => {
    const { fallback, ...options } = props;
    const model = useDomainListModel(options);

    if (!model.hasOrganization) {
      return null;
    }
    return (
      <DomainListContent
        key={model.scope}
        model={model}
        fallback={fallback}
      />
    );
  },
  { permission: 'org:sys_domains:read' },
);

const DomainListContent = ({ model, fallback }: { model: DomainListModel; fallback?: ReactNode }) => {
  const controller = useDomainListController(model);
  if (controller.rows.length === 0 && !controller.isLoading && !fallback) {
    return null;
  }

  return (
    <DomainListView
      controller={controller}
      fallback={fallback}
    >
      {controller.rows.map(row => (
        <DomainListRow
          key={row.id}
          row={row}
          canManageDomains={controller.canManageDomains}
        />
      ))}
    </DomainListView>
  );
};
