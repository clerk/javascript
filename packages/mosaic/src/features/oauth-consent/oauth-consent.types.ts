import type { OAuthConsentScope } from '@clerk/shared/types';

import type { SelectItem } from '../../components/select';
import type { ErrorDescription, MosaicMessages } from '../../localization';

export type OAuthConsentMessages = MosaicMessages['oauthConsent'];

export type OAuthConsentScopeRecord = Pick<OAuthConsentScope, 'scope' | 'description'>;

export interface OAuthConsentOrganization extends SelectItem {
  imageUrl?: string;
}

export type OAuthConsentClientIdentity =
  | { registration: 'dynamic' }
  | { registration: 'metadata_document'; metadataHost: string };

export interface OAuthConsentData {
  oauthApplicationName: string;
  clientIdentity: OAuthConsentClientIdentity | null;
  scopes: OAuthConsentScopeRecord[];
  hasOfflineAccess: boolean;
  applicationName: string;
  identifier: string;
  redirectUrl: string;
  redirectDomain: string;
  actionUrl: string;
  forwardedParams: [string, string][];
  renderBranding: boolean;
  organizations: OAuthConsentOrganization[];
  defaultOrganizationId: string | null;
  maxOrganizations: number;
}

export type OAuthConsentReadyModel = OAuthConsentData & { status: 'ready' };

export type OAuthConsentModel =
  | { status: 'loading' }
  | { status: 'fetching'; renderBranding: boolean }
  | { status: 'hidden' }
  | { status: 'error'; error: ErrorDescription }
  | OAuthConsentReadyModel;

export interface OAuthConsentScopeItem {
  scope: string;
  label: string;
  description?: string;
  required?: boolean;
}

export interface OAuthConsentScopeSelection {
  checked: readonly string[];
  onCheckedChange: (scope: string, checked: boolean) => void;
}

export type OAuthConsentOrganizationAccess = 'all' | 'selected';

interface OAuthConsentSingleOrganizationSelection {
  multiple?: false;
  organizationId: string | null;
  onOrganizationIdChange: (organizationId: string) => void;
}

interface OAuthConsentMultipleOrganizationSelection {
  multiple: true;
  organizationIds: readonly string[];
  onOrganizationIdsChange: (organizationIds: string[]) => void;
}

export type OAuthConsentOrganizationSelection =
  | OAuthConsentSingleOrganizationSelection
  | (OAuthConsentMultipleOrganizationSelection & { limit?: number; access?: never; onAccessChange?: never })
  | (OAuthConsentMultipleOrganizationSelection & {
      access: OAuthConsentOrganizationAccess;
      onAccessChange: (access: OAuthConsentOrganizationAccess) => void;
      limit?: never;
    });

export interface OAuthConsentViewProps {
  messages: OAuthConsentMessages;
  oauthApplicationName: string;
  clientIdentity: OAuthConsentClientIdentity | null;
  identifier: string;
  applicationName: string;
  scopes: OAuthConsentScopeItem[];
  scopeSelection: OAuthConsentScopeSelection;
  scope: string;
  hasOfflineAccess: boolean;
  organizations: OAuthConsentOrganization[];
  organizationSelection: OAuthConsentOrganizationSelection;
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
