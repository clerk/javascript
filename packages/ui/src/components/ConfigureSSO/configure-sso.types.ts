import type {
  OrganizationDomainOwnershipVerificationStatus,
  UpdateOrganizationEnterpriseConnectionParams,
} from '@clerk/shared/types';

import type { ConnectionScope } from './domain/connectionScope';
import type { OrganizationEnterpriseConnection } from './domain/organizationEnterpriseConnection';
import type { RefreshTestRunsOptions } from './hooks/useEnterpriseConnectionTestRuns';
import type { ProviderType } from './types';

export type SSOConnection = {
  id: string;
  name: string;
  active: boolean;
  provider: string;
  logoPublicUrl: string | null;
  domains: string[];
  syncUserAttributes: boolean;
  disableAdditionalIdentifications: boolean;
  oauthConfig: {
    clientId: string;
    redirectUri?: string;
    discoveryUrl?: string;
    authUrl?: string;
    tokenUrl?: string;
    userInfoUrl?: string;
    requiresPkce?: boolean;
  } | null;
  samlConnection: {
    idpEntityId: string;
    idpSsoUrl: string;
    idpCertificate: string;
    idpCertificateIssuedAt: number;
    idpCertificateExpiresAt: number;
    idpCertificates: Array<{ certificate: string; issuedAt: number | null; expiresAt: number | null }>;
    idpMetadataUrl: string;
    idpMetadata: string;
    acsUrl: string;
    spEntityId: string;
    spMetadataUrl: string;
    allowSubdomains: boolean;
    allowIdpInitiated: boolean;
    forceAuthn: boolean;
  } | null;
};

export type SSODomainVerification = {
  status: OrganizationDomainOwnershipVerificationStatus;
  expiresAt: Date | null;
  verifiedAt: Date | null;
  txtRecordName: string | null;
  txtRecordValue: string | null;
};

export type SSODomain = {
  id: string;
  name: string;
  ownershipVerification: SSODomainVerification | null;
};

export type SSOTestRun = {
  id: string;
  status: string;
  createdAt: Date | null;
  logs: Array<{ shortMessage?: string; code?: string; message?: string }>;
  parsedUserInfo: { emailAddress?: string; firstName?: string } | undefined;
};

export type SSOConnectionCommands = {
  createConnection: (provider: ProviderType) => Promise<void>;
  changeProvider: (id: string, provider: ProviderType) => Promise<void>;
  updateConnection: (id: string, params: UpdateOrganizationEnterpriseConnectionParams) => Promise<void>;
  setConnectionActive: (id: string, active: boolean) => Promise<void>;
  deleteConnection: (id: string) => Promise<void>;
  createTestRun: (id: string) => Promise<{ url: string } | undefined>;
};

export type SSODomainCommands = {
  createDomain: (name: string) => Promise<void>;
  prepareOwnershipVerification: (ids: string[]) => Promise<void>;
  removeDomain: (id: string) => Promise<void>;
};

export type SSOTestRuns = {
  rows: SSOTestRun[];
  totalCount: number;
  isLoading: boolean;
  isFetching: boolean;
  isPolling: boolean;
  page: number;
  setPage: (page: number) => void;
  refresh: (options?: RefreshTestRunsOptions) => Promise<void>;
  revalidateHasSuccessfulTestRun: () => Promise<boolean>;
};

export type ConfigureSSOModel = {
  ownerKey: string;
  canRun: () => boolean;
  isLoading: boolean;
  organizationName: string;
  enterpriseConnections: SSOConnection[];
  connectionScope: ConnectionScope;
  selectConnection: (scope: ConnectionScope) => void;
  enterpriseConnection: SSOConnection | undefined;
  connectionDomains: string[];
  setConnectionDomains: (domains: string[]) => Promise<void>;
  claimedDomains: Map<string, string>;
  organizationEnterpriseConnection: OrganizationEnterpriseConnection;
  enterpriseConnectionMutations: SSOConnectionCommands;
  testRuns: SSOTestRuns;
  organizationDomains: SSODomain[] | undefined;
  organizationDomainMutations: SSODomainCommands;
};
