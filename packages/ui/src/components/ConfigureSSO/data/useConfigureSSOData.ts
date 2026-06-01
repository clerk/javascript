import { __internal_useUserEnterpriseConnections, useOrganization, useSession, useUser } from '@clerk/shared/react';
import type {
  EmailAddressResource,
  EnterpriseConnectionResource,
  OrganizationResource,
  SignedInSessionResource,
  UserResource,
} from '@clerk/shared/types';

import { deriveFacts, type WizardFacts } from './deriveFacts';
import { type ConfigureSSOMutations, useConfigureSSOMutations } from './useConfigureSSOMutations';
import { type TestRunsController, useTestRunsController } from './useTestRunsController';

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
   * Re-runs the successful-test-run probe so derived facts (e.g.
   * `facts.hasSuccessfulTestRun`) pick up a run that just completed.
   */
  refreshTestRuns: TestRunsController['refresh'];
  /**
   * Every connection-domain mutation the wizard performs, pre-wrapped in
   * `useReverification`. Bundled into one object so the provider takes a single
   * prop instead of three raw mutation handles.
   */
  mutations: ConfigureSSOMutations;
  /**
   * The user's primary email address, used to derive the connection name on
   * create. Threaded through so the submit runner and steps don't each call
   * `useUser` for it.
   */
  primaryEmailAddress: EmailAddressResource | undefined;
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
 * state. Connection mutations are bundled into a single reverification-wrapped
 * `mutations` object via {@link useConfigureSSOMutations}.
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

  const {
    hasSuccessfulTestRun,
    isLoadingInitial: isLoadingTestRuns,
    refresh: refreshTestRuns,
  } = useTestRunsController(enterpriseConnection);

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

  const mutations = useConfigureSSOMutations({
    user,
    session,
    createEnterpriseConnection,
    updateEnterpriseConnection,
    deleteEnterpriseConnection,
  });

  return {
    isLoading: isLoadingEnterpriseConnections || isLoadingTestRuns,
    user,
    session,
    organization,
    enterpriseConnection,
    facts,
    refreshTestRuns,
    mutations,
    primaryEmailAddress: user?.primaryEmailAddress ?? undefined,
  };
};
