import type { OAuthConsentScope } from '@clerk/shared/types';

import type { SelectItem } from '../../components/select';
import type { ErrorDescription, MosaicMessages } from '../../localization';

export type OAuthConsentMessages = MosaicMessages['oauthConsent'];

export type OAuthConsentScopeRecord = Pick<OAuthConsentScope, 'scope' | 'description'>;

export interface OAuthConsentData {
  applicationName: string;
  oauthApplicationName: string;
  identifier: string;
  scopes: OAuthConsentScopeRecord[];
  hasOfflineAccess: boolean;
  organizations: SelectItem[];
  defaultOrganizationId: string | null;
  redirectUrl: string;
  redirectDomain: string;
  actionUrl: string;
  forwardedParams: [string, string][];
  renderBranding: boolean;
}

export type OAuthConsentReadyModel = OAuthConsentData & { status: 'ready' };

export type OAuthConsentModel =
  | { status: 'loading' }
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

export interface OAuthConsentViewProps {
  messages: OAuthConsentMessages;
  oauthApplicationName: string;
  identifier: string;
  applicationName: string;
  scopes: OAuthConsentScopeItem[];
  scopeSelection?: OAuthConsentScopeSelection;
  hasOfflineAccess: boolean;
  organizations: SelectItem[];
  organizationId: string | null;
  onOrganizationChange: (organizationId: string) => void;
  redirectUrl: string;
  redirectDomain: string;
  isRedirectUrlOpen: boolean;
  onRedirectUrlOpenChange: (open: boolean) => void;
  actionUrl: string;
  forwardedParams: [string, string][];
  renderBranding: boolean;
}
