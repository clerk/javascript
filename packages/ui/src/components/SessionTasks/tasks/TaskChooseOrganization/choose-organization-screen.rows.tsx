import {
  useChooseOrganizationRowAction,
  useInvitationPreviewController,
  useMembershipPreviewController,
} from './choose-organization-screen.controller';
import {
  InvitationPreviewView,
  MembershipPreviewView,
  SuggestionPreviewView,
} from './choose-organization-screen.rows.view';
import type { InvitationRowData, MembershipRowData, SuggestionRowData } from './choose-organization-screen.types';

type MembershipPreviewProps = {
  row: MembershipRowData;
  isOrganizationListLoaded: boolean;
  createOrganizationEnabled: boolean;
};

export const MembershipPreview = ({
  row,
  isOrganizationListLoaded,
  createOrganizationEnabled,
}: MembershipPreviewProps) => {
  const controller = useMembershipPreviewController(row, createOrganizationEnabled);
  if (!isOrganizationListLoaded) {
    return null;
  }
  return (
    <MembershipPreviewView
      organization={row.organization}
      {...controller}
    />
  );
};

type InvitationPreviewProps = {
  row: InvitationRowData;
  isOrganizationListLoaded: boolean;
  createOrganizationEnabled: boolean;
};

export const InvitationPreview = ({
  row,
  isOrganizationListLoaded,
  createOrganizationEnabled,
}: InvitationPreviewProps) => {
  const controller = useInvitationPreviewController(row);
  if (controller.acceptedOrganization) {
    return (
      <MembershipPreview
        row={controller.acceptedOrganization}
        isOrganizationListLoaded={isOrganizationListLoaded}
        createOrganizationEnabled={createOrganizationEnabled}
      />
    );
  }
  return (
    <InvitationPreviewView
      organization={row.organization}
      onAccept={controller.onAccept}
      isLoading={controller.isLoading}
    />
  );
};

export const SuggestionPreview = ({ row }: { row: SuggestionRowData }) => {
  const { run: onAccept, isLoading } = useChooseOrganizationRowAction(row.accept);
  return (
    <SuggestionPreviewView
      organization={row.organization}
      status={row.status}
      onAccept={onAccept}
      isLoading={isLoading}
    />
  );
};
