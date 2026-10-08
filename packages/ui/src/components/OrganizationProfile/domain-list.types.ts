import type {
  GetDomainsParams,
  OrganizationDomainVerificationStatus,
  OrganizationEnrollmentMode,
} from '@clerk/shared/types';
import type { RefCallback } from 'react';

import type { LocalizationKey } from '@/customizables';

export type DomainListModelOptions = GetDomainsParams & {
  verificationStatus?: OrganizationDomainVerificationStatus;
  enrollmentMode?: OrganizationEnrollmentMode;
};

export type DomainRow = {
  id: string;
  name: string;
  enrollmentMode: OrganizationEnrollmentMode;
  isVerified: boolean;
  isVerificationComplete: boolean;
};

export type DomainListModel = {
  scope: string;
  hasOrganization: boolean;
  canManageDomains: boolean;
  rows: DomainRow[];
  isLoading: boolean;
  canFetchNext: boolean;
  showSpinner: boolean;
  fetchNext: () => void;
};

export type DomainListData = {
  rows: DomainRow[];
  canManageDomains: boolean;
  isLoading: boolean;
  showSpinner: boolean;
  sentinelRef: RefCallback<HTMLElement> | undefined;
};

export type DomainMenuData = {
  actions: Array<{ label: LocalizationKey; onClick: () => void; isDestructive?: boolean }>;
};
