export type AccessProvider = 'okta' | 'entra' | 'google' | 'saml' | 'oidc';
export type ConnectionKind = 'sso' | 'directory';
export interface AccessDomain {
  name: string;
  verified: boolean;
  affiliationVerified?: boolean;
}
export interface AccessPolicy {
  id: string;
  status: 'draft' | 'active' | 'inactive';
  domains: AccessDomain[];
  authentication: 'default' | 'sso';
  ssoConnectionIds: string[];
  enrollment: 'invitation' | 'automatic' | 'request' | 'directory' | 'blocked';
  connectionNames?: Record<string, string>;
  canEdit?: boolean;
  directoryConnectionId: string | null;
  reverification: string;
  mfaEnabled: boolean;
  mfa: 'optional' | 'required';
}
export interface ConnectionConfiguration {
  name: string;
  provider: AccessProvider;
  mode: 'metadata' | 'file' | 'manual';
  metadataUrl: string;
  metadataFile: File | null;
  signOnUrl: string;
  issuer: string;
  certificate: string;
  clientId: string;
  clientSecret: string;
  tokenUrl: string;
  userInfoUrl: string;
  ssoConnectionId: string;
  defaultRole: string;
  groupRoles: Record<string, string>;
  serviceAccountFile: File | null;
  subjectEmail: string;
  syncGroups: boolean;
  domains?: string[];
  enabled?: boolean;
  directoryAttributeMapping?: Record<string, string>;
}
export interface AccessConnection {
  id: string;
  kind: ConnectionKind;
  status?: 'active' | 'inactive';
  configuration: ConnectionConfiguration;
  endpointUrl?: string;
  signOnUrl?: string;
  audience?: string;
  redirectUri?: string;
  token?: string;
  canManage?: boolean;
}
export interface ConnectionTestResult {
  id?: string;
  createdAt?: number;
  success: boolean;
  failureMessage?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  groups?: string[];
  groupNames?: Record<string, string>;
  groupRoles?: Record<string, string>;
  pending?: boolean;
}
export interface AccessData {
  policies: AccessPolicy[];
  defaultPolicy?: AccessPolicy;
  connections: AccessConnection[];
  live?: boolean;
  canCreateSso?: boolean;
  canEditPolicyAuthentication?: boolean;
  directoryReadyToRotate?: boolean;
  onManageDirectory?: (parentId: string | null) => void;
  canCreateDirectory?: boolean;
  eligibleSsoDomains?: string[];
  connectionLoadError?: boolean;
  retryConnections?: () => Promise<void>;
  isLoadingConnections?: boolean;
  onStartSsoTest?: (id: string) => Promise<string>;
  onConfigureDirectory?: (values: ConnectionConfiguration, id?: string) => Promise<AccessConnection>;
  onEnableSso?: (id: string) => Promise<AccessConnection>;
  canCreatePolicy?: boolean;
  newPolicyAuthentication?: AccessPolicy['authentication'];
  onSelectPolicy?: (id: string | null) => void;
  loadPolicy?: (id: string) => Promise<AccessPolicy>;
  policyListError?: boolean;
  retryPolicies?: () => Promise<void>;
  loadMorePolicies?: () => void;
  isLoadingMorePolicies?: boolean;
  onSavePolicy: (policy: AccessPolicy) => Promise<void>;
  onSaveConnection?: (kind: ConnectionKind, values: ConnectionConfiguration, id?: string) => Promise<AccessConnection>;
  onTestConnection?: (
    kind: ConnectionKind,
    values: ConnectionConfiguration,
    id?: string,
  ) => Promise<ConnectionTestResult>;
  onRotateDirectoryToken?: (id: string) => Promise<string>;
  onPrepareDomain?: (name: string) => Promise<{ name: string; value: string } | null>;
  onVerifyDomain?: (name: string) => Promise<boolean>;
  serviceProvider?: {
    signOnUrl: string;
    audience: string;
    redirectUri: string;
    scimUrl: string;
    token: string;
    dnsValue: string;
    testUrl: string;
  };
}
