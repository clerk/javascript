import { __internal_useUserEnterpriseConnections, useOrganization, useSession, useUser } from '@clerk/shared/react';
import type { UseUserEnterpriseConnectionsReturn } from '@clerk/shared/react/index';
import type {
  EnterpriseConnectionResource,
  OrganizationResource,
  SignedInSessionResource,
  UserResource,
} from '@clerk/shared/types';

import { deriveFacts, type WizardFacts } from './deriveFacts';
import { useTestRunsController } from './useTestRunsController';

export interface ConfigureSSOData {
  /**
   * Whether the upstream data is still loading. The wizard is gated on this one
   * level above the provider so the context never observes a loading state.
   */
  isLoading: boolean;
  user: UserResource | null | undefined;
  session: SignedInSessionResource | null | undefined;
  organization: OrganizationResource | null | undefined;
  /**
   * The enterprise connection from the user's primary email address domain.
   * Currently FAPI only supports one enterprise connection per user.
   */
  enterpriseConnection: EnterpriseConnectionResource | undefined;
  /**
   * The single set of derived booleans the wizard makes decisions from.
   */
  facts: WizardFacts;
  /**
   * Raw mutation passed through unchanged (no reverification wrapping yet).
   */
  createEnterpriseConnection: UseUserEnterpriseConnectionsReturn['createEnterpriseConnection'];
  /**
   * Raw mutation passed through unchanged (no reverification wrapping yet).
   */
  updateEnterpriseConnection: UseUserEnterpriseConnectionsReturn['updateEnterpriseConnection'];
  /**
   * Raw mutation passed through unchanged (no reverification wrapping yet).
   */
  deleteEnterpriseConnection: UseUserEnterpriseConnectionsReturn['deleteEnterpriseConnection'];
}

/**
 * The single upstream data hook for the ConfigureSSO wizard.
 *
 * It owns every fetch the wizard depends on — the user's enterprise
 * connections, the successful-test-run probe, the user, the session, and the
 * active organization — and folds the raw resources into a single {@link
 * WizardFacts} object via {@link deriveFacts}.
 *
 * Loading is surfaced as a single `isLoading` flag so the caller can gate the
 * skeleton one level above the provider; the provider never sees a loading
 * state. Mutations are passed through unchanged.
 */
export const useConfigureSSOData = (): ConfigureSSOData => {
  const {
    data: enterpriseConnections,
    isLoading: isLoadingEnterpriseConnections,
    createEnterpriseConnection,
    updateEnterpriseConnection,
    deleteEnterpriseConnection,
  } = __internal_useUserEnterpriseConnections({ enabled: true });

  // Currently FAPI only supports one enterprise connection per user
  const enterpriseConnection = enterpriseConnections?.[0];

  const { hasSuccessfulTestRun, isLoadingInitial: isLoadingTestRuns } = useTestRunsController(enterpriseConnection);

  const { user } = useUser();
  const { session } = useSession();
  const { organization } = useOrganization();

  const facts = deriveFacts({
    user,
    session,
    connection: enterpriseConnection,
    hasSuccessfulTestRun,
    organization,
  });

  return {
    isLoading: isLoadingEnterpriseConnections || isLoadingTestRuns,
    user,
    session,
    organization,
    enterpriseConnection,
    facts,
    createEnterpriseConnection,
    updateEnterpriseConnection,
    deleteEnterpriseConnection,
  };
};
