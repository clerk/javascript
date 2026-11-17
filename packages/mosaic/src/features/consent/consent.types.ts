import type { OAuthConsentScope } from '@clerk/shared/types';

import type { SelectItem } from '../../components/select';
import type { ErrorDescription, MosaicMessages } from '../../localization';

export type ConsentMessages = MosaicMessages['consent'];

export type ConsentScopeRecord = Pick<OAuthConsentScope, 'scope' | 'description'>;

export interface ConsentOrganization extends SelectItem {
  imageUrl?: string;
}

export interface ConsentData {
  oauthApplicationName: string;
  scopes: ConsentScopeRecord[];
  hasOfflineAccess: boolean;
  applicationName: string;
  identifier: string;
  redirectUrl: string;
  redirectDomain: string;
  actionUrl: string;
  forwardedParams: [string, string][];
  renderBranding: boolean;
  organizations: ConsentOrganization[];
  defaultOrganizationId: string | null;
}

export type ConsentReadyModel = ConsentData & { status: 'ready' };

export type ConsentModel =
  | { status: 'loading' }
  | { status: 'fetching'; renderBranding: boolean }
  | { status: 'hidden' }
  | { status: 'error'; error: ErrorDescription }
  | ConsentReadyModel;

export interface ConsentScopeItem {
  scope: string;
  label: string;
  description?: string;
  required?: boolean;
}

export interface ConsentScopeSelection {
  checked: readonly string[];
  onCheckedChange: (scope: string, checked: boolean) => void;
}

export type ConsentOrganizationAccess = 'all' | 'selected';

export interface ConsentOrganizationSelection {
  access: ConsentOrganizationAccess;
  onAccessChange: (access: ConsentOrganizationAccess) => void;
  selected: readonly string[];
  onSelectedChange: (organizationIds: string[]) => void;
}

export interface ConsentViewProps {
  messages: ConsentMessages;
  oauthApplicationName: string;
  identifier: string;
  applicationName: string;
  scopes: ConsentScopeItem[];
  scopeSelection?: ConsentScopeSelection;
  hasOfflineAccess: boolean;
  organizations: ConsentOrganization[];
  organizationId: string | null;
  onOrganizationChange: (organizationId: string) => void;
  organizationSelection?: ConsentOrganizationSelection;
  redirectUrl: string;
  redirectDomain: string;
  isRedirectUrlOpen: boolean;
  onRedirectUrlOpenChange: (open: boolean) => void;
  pendingAction?: 'allow' | 'deny';
  onAllow: () => void;
  onDeny: () => void;
  actionUrl: string;
  forwardedParams: [string, string][];
}
