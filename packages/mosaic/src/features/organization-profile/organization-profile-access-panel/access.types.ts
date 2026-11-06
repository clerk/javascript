export type AccessProvider = 'okta' | 'entra' | 'google' | 'saml' | 'oidc';
export type ConnectionKind = 'sso' | 'directory';
export interface AccessDomain {
  name: string;
  verified: boolean;
}
export interface AccessPolicy {
  id: string;
  status: 'draft' | 'active' | 'inactive';
  domains: AccessDomain[];
  authentication: 'default' | 'sso';
  ssoConnectionIds: string[];
  enrollment: 'invitation' | 'automatic' | 'request' | 'directory';
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
}
export interface AccessConnection {
  id: string;
  kind: ConnectionKind;
  status?: 'active' | 'inactive';
  configuration: ConnectionConfiguration;
}
export interface ConnectionTestResult {
  success: boolean;
  email?: string;
  firstName?: string;
  lastName?: string;
  groups?: string[];
}
export interface AccessData {
  policies: AccessPolicy[];
  connections: AccessConnection[];
  onSavePolicy: (policy: AccessPolicy) => Promise<void>;
  onSaveConnection: (kind: ConnectionKind, values: ConnectionConfiguration, id?: string) => Promise<AccessConnection>;
  onTestConnection: (kind: ConnectionKind, values: ConnectionConfiguration) => Promise<ConnectionTestResult>;
  onVerifyDomain: (name: string) => Promise<boolean>;
  serviceProvider: {
    signOnUrl: string;
    audience: string;
    redirectUri: string;
    scimUrl: string;
    token: string;
    dnsValue: string;
    testUrl: string;
  };
}
