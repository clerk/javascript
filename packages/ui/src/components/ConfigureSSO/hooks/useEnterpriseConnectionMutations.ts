import { useReverification } from '@clerk/shared/react';
import type { UseOrganizationEnterpriseConnectionsReturn } from '@clerk/shared/react/index';
import type {
  DeletedObjectResource,
  EmailAddressResource,
  EnterpriseConnectionResource,
  EnterpriseConnectionTestRunInitResource,
  OrganizationResource,
  UpdateOrganizationEnterpriseConnectionParams,
} from '@clerk/shared/types';
import { useMemo } from 'react';

import type { ProviderType } from '../types';

/**
 * The full set of enterprise-connection mutations, each pre-wrapped in
 * {@link useReverification}.
 *
 * Every function here performs a sensitive write against the signed-in user's
 * enterprise connections, so each is wrapped in `useReverification`: a no-op
 * unless the backend rejects the call with `session_reverification_required`,
 * in which case it opens the reverification UI, waits, and retries on success.
 * Callers therefore never wrap inline or reason about reverification
 * themselves — they just await the mutation.
 *
 * This surface is intentionally connection-domain only: it carries no wizard,
 * step, or navigation concepts, so it can be lifted into a reusable hook for
 * custom self-serve SSO flows.
 */
export interface EnterpriseConnectionMutations {
  /**
   * Creates a new enterprise connection for the user's primary email domain,
   * scoped to the active organization (inferred from the org-scoped endpoint's
   * URL path). Derives the connection name from the email domain. Resolves to
   * `undefined` without creating when no primary email address is available (no
   * domain to derive a name from).
   */
  createConnection: (
    provider: ProviderType,
    primaryEmailAddress?: EmailAddressResource,
  ) => Promise<EnterpriseConnectionResource | undefined>;
  /**
   * Updates an existing enterprise connection (e.g. its SAML IdP metadata).
   */
  updateConnection: (
    id: string,
    params: UpdateOrganizationEnterpriseConnectionParams,
  ) => Promise<EnterpriseConnectionResource | undefined>;
  /**
   * Toggles the `active` flag on an enterprise connection.
   */
  setConnectionActive: (id: string, active: boolean) => Promise<EnterpriseConnectionResource | undefined>;
  /**
   * Permanently deletes an enterprise connection.
   */
  deleteConnection: (id: string) => Promise<DeletedObjectResource | undefined>;
  /**
   * Kicks off a new identity-provider test run for an enterprise connection and
   * resolves with the test-run URL to open.
   */
  createTestRun: (id: string) => Promise<EnterpriseConnectionTestRunInitResource>;
}

export interface UseEnterpriseConnectionMutationsParams {
  organization: OrganizationResource | null | undefined;
  createEnterpriseConnection: UseOrganizationEnterpriseConnectionsReturn['createEnterpriseConnection'];
  updateEnterpriseConnection: UseOrganizationEnterpriseConnectionsReturn['updateEnterpriseConnection'];
  deleteEnterpriseConnection: UseOrganizationEnterpriseConnectionsReturn['deleteEnterpriseConnection'];
}

/**
 * Returns the {@link EnterpriseConnectionMutations} surface — every
 * enterprise-connection write the flow needs, bundled into one stable, memoized
 * object of reverification-wrapped functions.
 *
 * Takes the raw mutation handles from the source enterprise-connections query
 * plus the active `organization` the create/test-run flows need, and returns a
 * stable memoized object of {@link useReverification}-wrapped functions. Each
 * returned function owns only reverification and the connection name derivation;
 * the calling UI keeps its own loading/error lifecycle.
 */
export const useEnterpriseConnectionMutations = ({
  organization,
  createEnterpriseConnection,
  updateEnterpriseConnection,
  deleteEnterpriseConnection,
}: UseEnterpriseConnectionMutationsParams): EnterpriseConnectionMutations => {
  const createConnection = useReverification(
    async (provider: ProviderType, primaryEmailAddress?: EmailAddressResource) => {
      const emailDomain = primaryEmailAddress?.emailAddress.split('@')[1];

      if (!emailDomain) {
        return undefined;
      }

      // The organization is inferred from the URL path on the org-scoped
      // endpoint, so we don't pass `organizationId` in the body.
      return createEnterpriseConnection({
        provider,
        name: emailDomain,
      });
    },
  );

  const updateConnection = useReverification((id: string, params: UpdateOrganizationEnterpriseConnectionParams) =>
    updateEnterpriseConnection(id, params),
  );

  const setConnectionActive = useReverification((id: string, active: boolean) =>
    updateEnterpriseConnection(id, { active }),
  );

  const deleteConnection = useReverification((id: string) => deleteEnterpriseConnection(id));

  const createTestRun = useReverification((id: string) => {
    // The flow never reaches the test step without an active organization;
    // guard so the wrapped fetcher stays well-typed without leaking an
    // `undefined` organization.
    if (!organization) {
      throw new Error(
        'useEnterpriseConnectionMutations.createTestRun called before the organization resource was loaded.',
      );
    }
    return organization.createEnterpriseConnectionTestRun(id);
  });

  return useMemo(
    () => ({
      createConnection,
      updateConnection,
      setConnectionActive,
      deleteConnection,
      createTestRun,
    }),
    [createConnection, updateConnection, setConnectionActive, deleteConnection, createTestRun],
  );
};
