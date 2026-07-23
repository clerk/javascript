import type {
  EmailAddressResource,
  EnterpriseConnectionResource,
  OrganizationDomainResource,
  UserResource,
} from '@clerk/shared/types';

import type { EnterpriseConnectionProviderType, OidcProviderType } from '../types';

/**
 * OIDC providers are recognized by protocol prefix, never by literal: the backend
 * stores a derived `oidc_<slug>` key (open family), so the read-back provider is
 * not a fixed enum. SAML providers stay exact literals. Single source of the
 * prefix notion — dispatch and configuration checks both read it from here.
 */
export const isOidcProvider = (provider: string): provider is OidcProviderType => provider.startsWith('oidc');

/**
 * The email whose domain backs the connection: the user's primary address if
 * present, otherwise the first address they have not yet verified (the one they
 * are working through). The single source of this rule — the domain entity, the
 * reachability guards, and the verify-domain step all read it from here, so they
 * can never drift. Pure: a plain function over the user resource, no React.
 *
 * The two branches converge today because FAPI promotes the first verified
 * address to primary; keeping the rule in one place means any future divergence
 * stays consistent across every call site.
 */
export const connectionBackingEmail = (user: UserResource | null | undefined): EmailAddressResource | undefined =>
  user?.primaryEmailAddress ?? user?.emailAddresses?.find(e => e.verification.status !== 'verified');

/**
 * The inputs {@link organizationEnterpriseConnection} composes. Every field is a
 * plain value — the entity is pure and knows nothing about React or the wizard.
 */
export interface OrganizationEnterpriseConnectionInput {
  /** FAPI currently supports a single connection per organization. */
  connection: EnterpriseConnectionResource | null | undefined;
  /** Probed upstream — not a property of the connection resource itself. */
  hasSuccessfulTestRun: boolean;
}

/** Display-facing lifecycle summary — the wizard's navigation guards keep reading the raw booleans. */
export type OrganizationEnterpriseConnectionStatus = 'unconfigured' | 'in_progress' | 'active' | 'inactive';

/**
 * The active organization's SSO-config domain entity: an immutable, pure value
 * object the wizard makes every flow decision from. A snapshot of flattened booleans/values.
 */
export interface OrganizationEnterpriseConnection {
  readonly provider: EnterpriseConnectionProviderType | undefined;
  readonly hasConnection: boolean;
  readonly isActive: boolean;
  readonly hasMinimumConfiguration: boolean;
  readonly hasSuccessfulTestRun: boolean;
  readonly status: OrganizationEnterpriseConnectionStatus;
}

export const isEnterpriseConnectionConfigured = (
  connection: EnterpriseConnectionResource | null | undefined,
): boolean => {
  if (!connection) {
    return false;
  }
  // OIDC exposes only the client ID on the resource; the secret and manual endpoints are write-only.
  if (isOidcProvider(connection.provider)) {
    return Boolean(connection.oauthConfig?.clientId);
  }
  return Boolean(connection.samlConnection?.idpSsoUrl && connection.samlConnection?.idpEntityId);
};

export const areAllOrganizationDomainsVerified = (domains: OrganizationDomainResource[] | null | undefined): boolean =>
  !!domains?.length && domains.every(domain => domain.ownershipVerification?.status === 'verified');

const connectionStatus = ({
  hasConnection,
  isActive,
  hasMinimumConfiguration,
  hasSuccessfulTestRun,
}: Pick<
  OrganizationEnterpriseConnection,
  'hasConnection' | 'isActive' | 'hasMinimumConfiguration' | 'hasSuccessfulTestRun'
>): OrganizationEnterpriseConnectionStatus => {
  if (!hasConnection) {
    return 'unconfigured';
  }
  if (isActive) {
    return 'active';
  }
  if (hasMinimumConfiguration && hasSuccessfulTestRun) {
    return 'inactive';
  }
  return 'in_progress';
};

export const organizationEnterpriseConnection = ({
  connection,
  hasSuccessfulTestRun,
}: OrganizationEnterpriseConnectionInput): OrganizationEnterpriseConnection => {
  const hasConnection = Boolean(connection);
  const isActive = Boolean(connection?.active);
  const hasMinimumConfiguration = isEnterpriseConnectionConfigured(connection);

  return {
    // Boundary cast at the FAPI edge: SAML returns exact literals, OIDC an open
    // `oidc_<slug>` family. An unrecognized value degrades downstream (dispatch
    // falls back), so the honest open type — not the `oidc_custom` input alias — holds here.
    provider: connection?.provider as EnterpriseConnectionProviderType | undefined,
    hasConnection,
    isActive,
    hasMinimumConfiguration,
    hasSuccessfulTestRun,
    status: connectionStatus({ hasConnection, isActive, hasMinimumConfiguration, hasSuccessfulTestRun }),
  };
};
