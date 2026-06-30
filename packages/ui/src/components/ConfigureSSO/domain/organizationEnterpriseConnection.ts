import type {
  EmailAddressResource,
  EnterpriseConnectionResource,
  OrganizationDomainResource,
  UserResource,
} from '@clerk/shared/types';

import type { ProviderType } from '../types';

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
  readonly provider: ProviderType | undefined;
  readonly hasConnection: boolean;
  readonly isActive: boolean;
  readonly hasMinimumConfiguration: boolean;
  readonly hasSuccessfulTestRun: boolean;
  readonly status: OrganizationEnterpriseConnectionStatus;
}

// TODO - Update to support OpenID Connect
export const isEnterpriseConnectionConfigured = (
  connection: EnterpriseConnectionResource | null | undefined,
): boolean => Boolean(connection?.samlConnection?.idpSsoUrl && connection?.samlConnection?.idpEntityId);

export const areAllOrganizationDomainsVerified = (domains: OrganizationDomainResource[] | null | undefined): boolean =>
  !!domains?.length && domains.every(domain => domain.ownershipVerification?.status === 'verified');

export const hasAnyOrganizationDomainsVerified = (domains: OrganizationDomainResource[] | null | undefined): boolean =>
  !!domains?.length && domains.some(domain => domain.ownershipVerification?.status === 'verified');

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
    provider: connection?.provider as ProviderType | undefined,
    hasConnection,
    isActive,
    hasMinimumConfiguration,
    hasSuccessfulTestRun,
    status: connectionStatus({ hasConnection, isActive, hasMinimumConfiguration, hasSuccessfulTestRun }),
  };
};
