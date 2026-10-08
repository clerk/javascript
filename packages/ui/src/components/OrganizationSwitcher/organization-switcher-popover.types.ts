export type OrganizationSwitcherPopoverData = {
  isReady: boolean;
  isStandalone: boolean;
  hidePersonal: boolean;
  currentOrgPreview: { id: string; name: string; slug: string | null; imageUrl: string; hasImage: boolean } | undefined;
  userRolePreview:
    | { organizationMemberships: { organization: { id: string }; role: string; roleName: string }[] }
    | undefined;
  personalPreview: { firstName: string | null; lastName: string | null; imageUrl: string } | undefined;
};

export type OrganizationSwitcherPopoverModel = OrganizationSwitcherPopoverData & {
  scopeKey: string;
  canRun: () => boolean;
  selectOrganization: (organizationId: string) => Promise<boolean>;
  selectPersonal: () => Promise<boolean>;
  createOrganization: () => unknown;
  manageOrganization: () => unknown;
};

export type OrganizationSwitcherPopoverController = OrganizationSwitcherPopoverData & {
  onOrganizationClick: (organizationId: string) => Promise<boolean>;
  onPersonalWorkspaceClick: () => Promise<boolean>;
  onCreateOrganizationClick: () => unknown;
  onManageOrganizationClick: () => unknown;
};
