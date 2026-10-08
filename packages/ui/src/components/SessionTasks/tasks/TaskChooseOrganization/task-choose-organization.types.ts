export type OrganizationCreationDefaultsData = {
  advisory: {
    code: 'organization_already_exists';
    meta: Record<string, string>;
  } | null;
  form?: {
    name: string;
    slug: string;
    logo: string | null;
  };
};

export type TaskChooseOrganizationFlow = 'create' | 'choose';

export type TaskChooseOrganizationData = {
  scopeKey: string;
  exclusiveOrganizationId?: string;
  isOrganizationListLoaded: boolean;
  isLoading: boolean;
  hasExistingResources: boolean;
  isOrganizationCreationDisabled: boolean;
  organizationCreationDefaults: OrganizationCreationDefaultsData | null | undefined;
  identifier: string | null | undefined;
  activateExclusiveOrganization: () => Promise<void>;
  signOut: () => Promise<void>;
};

export type TaskChooseOrganizationViewProps = {
  isOrganizationCreationDisabled: boolean;
  isLoading: boolean;
  initialFlow: TaskChooseOrganizationFlow;
  organizationCreationDefaults: OrganizationCreationDefaultsData | null | undefined;
  identifier: string | null | undefined;
  signOut: () => Promise<void>;
};

export type TaskChooseOrganizationFooterProps = Pick<TaskChooseOrganizationViewProps, 'identifier' | 'signOut'>;

export type TaskChooseOrganizationFlowController = {
  currentFlow: TaskChooseOrganizationFlow;
  onCancel?: () => void;
  onCreateOrganizationClick: () => void;
};

export type TaskChooseOrganizationFlowsViewProps = TaskChooseOrganizationFlowController & {
  organizationCreationDefaults?: OrganizationCreationDefaultsData | null;
};
