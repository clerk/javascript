import { useReverification } from '@clerk/shared/react';
import type { UseUserEnterpriseConnectionsReturn } from '@clerk/shared/react/index';
import type {
  DeletedObjectResource,
  EmailAddressResource,
  EnterpriseConnectionResource,
  EnterpriseConnectionTestRunInitResource,
  SignedInSessionResource,
  UpdateMeEnterpriseConnectionParams,
  UserResource,
} from '@clerk/shared/types';
import { useMemo } from 'react';

import type { ProviderType } from '../types';

/**
 * Every connection-domain mutation the ConfigureSSO wizard performs, each
 * pre-wrapped in {@link useReverification}.
 *
 * `useReverification` is a no-op unless the backend rejects a call with
 * `session_reverification_required`; when it does, it opens the reverification
 * UI, waits, and retries on success. Wrapping every sensitive connection
 * mutation here is the established `@clerk/ui` convention and means steps never
 * wrap inline or worry about reverification themselves.
 *
 * The email-domain mutations on the verify-domain step are intentionally NOT
 * part of this layer yet — they're entangled with that step's mount refs and a
 * later sub-item folds them in.
 */
export interface ConfigureSSOMutations {
  /**
   * Creates a new enterprise connection for the user's primary email domain,
   * scoped to the active organization. Derives the connection name from the
   * email domain and the organization id from the active session. Resolves
   * without creating when no primary email address is available.
   */
  createConnection: (
    provider: ProviderType,
    primaryEmailAddress?: EmailAddressResource,
  ) => Promise<EnterpriseConnectionResource | undefined>;
  /**
   * Updates an existing enterprise connection (e.g. the SAML IdP metadata).
   */
  updateConnection: (
    id: string,
    params: UpdateMeEnterpriseConnectionParams,
  ) => Promise<EnterpriseConnectionResource | undefined>;
  /**
   * Toggles the `active` flag on an enterprise connection.
   */
  setConnectionActive: (id: string, active: boolean) => Promise<EnterpriseConnectionResource | undefined>;
  /**
   * Deletes an enterprise connection.
   */
  deleteConnection: (id: string) => Promise<DeletedObjectResource | undefined>;
  /**
   * Kicks off a new IdP test run for an enterprise connection and returns the
   * test-run URL to open.
   */
  createTestRun: (id: string) => Promise<EnterpriseConnectionTestRunInitResource>;
}

interface UseConfigureSSOMutationsParams {
  user: UserResource | null | undefined;
  session: SignedInSessionResource | null | undefined;
  createEnterpriseConnection: UseUserEnterpriseConnectionsReturn['createEnterpriseConnection'];
  updateEnterpriseConnection: UseUserEnterpriseConnectionsReturn['updateEnterpriseConnection'];
  deleteEnterpriseConnection: UseUserEnterpriseConnectionsReturn['deleteEnterpriseConnection'];
}

/**
 * Centralizes every connection-domain mutation the ConfigureSSO wizard makes
 * into one reverification-wrapped layer, consumed by steps from context.
 *
 * Takes the raw mutation handles from {@link useConfigureSSOData} plus the
 * `user`/`session` the create flow needs, and returns a stable memoized object
 * of {@link useReverification}-wrapped functions. Card loading/error lifecycle
 * stays with the calling step — this layer is concerned only with reverification
 * and the connection name/org derivation.
 */
export const useConfigureSSOMutations = ({
  user,
  session,
  createEnterpriseConnection,
  updateEnterpriseConnection,
  deleteEnterpriseConnection,
}: UseConfigureSSOMutationsParams): ConfigureSSOMutations => {
  const createConnection = useReverification(
    async (provider: ProviderType, primaryEmailAddress?: EmailAddressResource) => {
      const emailDomain = primaryEmailAddress?.emailAddress.split('@')[1];
      const organizationId = session?.lastActiveOrganizationId ?? null;

      if (!emailDomain) {
        return undefined;
      }

      return createEnterpriseConnection({
        provider,
        name: emailDomain,
        organizationId,
      });
    },
  );

  const updateConnection = useReverification((id: string, params: UpdateMeEnterpriseConnectionParams) =>
    updateEnterpriseConnection(id, params),
  );

  const setConnectionActive = useReverification((id: string, active: boolean) =>
    updateEnterpriseConnection(id, { active }),
  );

  const deleteConnection = useReverification((id: string) => deleteEnterpriseConnection(id));

  const createTestRun = useReverification((id: string) => {
    // The wizard never reaches the test step without a loaded user; guard so the
    // wrapped fetcher stays well-typed without leaking an `undefined` user.
    if (!user) {
      throw new Error('useConfigureSSOMutations.createTestRun called before the user resource was loaded.');
    }
    return user.createEnterpriseConnectionTestRun(id);
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
