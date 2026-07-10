import { useClerk, useOrganization, useSession } from '@clerk/shared/react';
import { eventFlowStepMounted } from '@clerk/shared/telemetry';
import type { EnterpriseConnectionResource, OrganizationDomainResource } from '@clerk/shared/types';
import { useCallback, useEffect, useRef, useState } from 'react';

import type { OrganizationEnterpriseConnection } from '@/components/ConfigureSSO/domain/organizationEnterpriseConnection';
import { areAllOrganizationDomainsVerified } from '@/components/ConfigureSSO/domain/organizationEnterpriseConnection';
import { useOrganizationEnterpriseConnection } from '@/components/ConfigureSSO/hooks/useOrganizationEnterpriseConnection';
import type { ProviderType } from '@/components/ConfigureSSO/types';
import { getClerkAPIErrorMessage, getFieldError, getGlobalError } from '@/utils/errorHandler';

import { useMosaicEnvironment } from '../hooks/useMosaicEnvironment';
import type { Snapshot } from '../machine/types';
import { useMachine } from '../machine/useMachine';
import type {
  OrganizationProfileSecurityPanelOverviewContext,
  OrganizationProfileSecurityPanelOverviewEvent,
} from './organization-profile-security-panel-overview.machine';
import { organizationProfileSecurityPanelOverviewMachine } from './organization-profile-security-panel-overview.machine';
import type {
  OrganizationProfileSecurityWizardContext,
  OrganizationProfileSecurityWizardEvent,
} from './organization-profile-security-wizard.machine';
import { organizationProfileSecurityWizardMachine } from './organization-profile-security-wizard.machine';
import type {
  OrganizationProfileSecurityWizardConfigureContext,
  OrganizationProfileSecurityWizardConfigureEvent,
} from './organization-profile-security-wizard-configure.machine';
import {
  CONFIGURE_PROVIDER_STEPS,
  organizationProfileSecurityWizardConfigureMachine,
  SAML_SUBMIT_STEP_ID,
} from './organization-profile-security-wizard-configure.machine';
import type {
  OrganizationProfileSecurityWizardDomainsAddContext,
  OrganizationProfileSecurityWizardDomainsAddEvent,
} from './organization-profile-security-wizard-domains-add.machine';
import { organizationProfileSecurityWizardDomainsAddMachine } from './organization-profile-security-wizard-domains-add.machine';
import type {
  OrganizationProfileSecurityWizardDomainsPrepareContext,
  OrganizationProfileSecurityWizardDomainsPrepareEvent,
} from './organization-profile-security-wizard-domains-prepare.machine';
import { organizationProfileSecurityWizardDomainsPrepareMachine } from './organization-profile-security-wizard-domains-prepare.machine';
import type {
  OrganizationProfileSecurityWizardDomainsRemoveContext,
  OrganizationProfileSecurityWizardDomainsRemoveEvent,
} from './organization-profile-security-wizard-domains-remove.machine';
import { organizationProfileSecurityWizardDomainsRemoveMachine } from './organization-profile-security-wizard-domains-remove.machine';

/**
 * Reproduces the legacy `handleError(err, [], setError)` global-error extraction the overview
 * card used, but re-throws a normalized `Error` so the machine layer stays Clerk-free (it only
 * stores `error.message`). The first *global* Clerk API message is what the legacy card surfaced;
 * a non-Clerk error passes through unchanged so its own message shows.
 */
const toConnectionError = (err: unknown): Error => {
  if (err instanceof Error) {
    const globalError = getGlobalError(err);
    return globalError ? new Error(getClerkAPIErrorMessage(globalError)) : err;
  }
  return new Error('Something went wrong. Please try again.');
};

/**
 * The verify-domain step's error extraction: field-first, then global — mirroring the legacy
 * `getFieldError(err) ?? getGlobalError(err)` the domain create / prepare handlers used, unlike
 * the global-only overview flow. Normalized to a plain `Error` so the machine stays Clerk-free.
 */
const toDomainError = (err: unknown): Error => {
  if (err instanceof Error) {
    const apiError = getFieldError(err) ?? getGlobalError(err);
    return apiError ? new Error(getClerkAPIErrorMessage(apiError)) : err;
  }
  return new Error('Something went wrong. Please try again.');
};

/** The user's primary-email domain, offered as a one-click add (legacy `DomainSuggestion`). */
const emailDomain = (email: string | undefined): string | null => email?.split('@')[1]?.trim().toLowerCase() || null;

interface OrganizationProfileSecurityOverviewFlow {
  snapshot: Snapshot<OrganizationProfileSecurityPanelOverviewContext>;
  send: (event: OrganizationProfileSecurityPanelOverviewEvent) => void;
  /** Whether the typed confirmation currently matches the org name (the remove guard). */
  canConfirmRemove: boolean;
}

interface OrganizationProfileSecurityWizardFlow {
  snapshot: Snapshot<OrganizationProfileSecurityWizardContext>;
  send: (event: OrganizationProfileSecurityWizardEvent) => void;
}

/** The verify-domain step's three concurrent mutation flows plus the data the step renders. */
export interface OrganizationProfileSecurityWizardDomainsStep {
  domains: OrganizationDomainResource[] | undefined;
  suggestedDomain: string | null;
  hasConnection: boolean;
  isConnectionActive: boolean;
  add: {
    snapshot: Snapshot<OrganizationProfileSecurityWizardDomainsAddContext>;
    send: (event: OrganizationProfileSecurityWizardDomainsAddEvent) => void;
  };
  prepare: {
    snapshot: Snapshot<OrganizationProfileSecurityWizardDomainsPrepareContext>;
    send: (event: OrganizationProfileSecurityWizardDomainsPrepareEvent) => void;
  };
  remove: {
    snapshot: Snapshot<OrganizationProfileSecurityWizardDomainsRemoveContext>;
    send: (event: OrganizationProfileSecurityWizardDomainsRemoveEvent) => void;
  };
  onStepMounted: () => void;
}

/**
 * The `configure` step's flow: the collapsed middle (`select-provider → configure-provider`) +
 * inner per-provider SAML wizard. `providerSteps` / `submitStepId` are the per-provider inputs the
 * view walks; `onParentNext` / `onParentPrev` forward the boundary navigations (terminal non-submit
 * Continue, first Previous) to the outer wizard, which the machine cannot reach directly.
 */
export interface OrganizationProfileSecurityWizardConfigureStep {
  snapshot: Snapshot<OrganizationProfileSecurityWizardConfigureContext>;
  send: (event: OrganizationProfileSecurityWizardConfigureEvent) => void;
  /** The provider whose SAML sub-flow is being configured (undefined until a connection exists). */
  provider: ProviderType | undefined;
  /** Ordered inner SAML step ids for `provider` (empty until a connection exists). */
  providerSteps: string[];
  /** The inner step id that submits `updateConnection`. */
  submitStepId: string;
  /** Direction of entry into the step, so the view can force select-provider on a forward mount. */
  enteredForward: boolean;
  /** Forward a boundary navigation to the outer wizard (no mutation involved). */
  onParentNext: () => void;
  onParentPrev: () => void;
}

/**
 * The gate that decides whether the Security panel (and, in the shell, its tab) is
 * shown. Reproduces legacy's page gate (`OrganizationProfileRoutes.tsx` +
 * `OrganizationProfileNavbar.tsx`): the enterprise-SSO feature flag
 * (`environment.userSettings.enterpriseSSO.self_serve_sso && organization.selfServeSSOEnabled`)
 * and the `org:sys_entconns:manage` permission. It waits for the organization, session,
 * AND environment to all resolve before deciding `hidden`, so the tab never flash-hides.
 *
 * Exported so the shell can gate the Security *tab* on exactly the same decision the
 * panel gates its body on (single source of truth — no duplicated branch).
 */
export type OrganizationProfileSecurityGate =
  | { status: 'loading' }
  | { status: 'hidden' }
  | { status: 'visible'; organizationName: string };

export function useOrganizationProfileSecurityGate(): OrganizationProfileSecurityGate {
  const { isLoaded: isOrganizationLoaded, organization } = useOrganization();
  const { isLoaded: isSessionLoaded, session } = useSession();
  const environment = useMosaicEnvironment();

  // A not-yet-known input must never collapse straight to 'hidden' (that flash-hides the tab).
  if (!isOrganizationLoaded || !isSessionLoaded || !environment) {
    return { status: 'loading' };
  }

  const canManage = session?.checkAuthorization({ permission: 'org:sys_entconns:manage' }) ?? false;
  const featureEnabled =
    environment.userSettings.enterpriseSSO.self_serve_sso && Boolean(organization?.selfServeSSOEnabled);

  if (!organization || !canManage || !featureEnabled) {
    return { status: 'hidden' };
  }

  return { status: 'visible', organizationName: organization.name };
}

type OrganizationProfileSecurityPanelController =
  | { status: 'loading' }
  | { status: 'hidden' }
  | {
      status: 'ready';
      /** `overview` shows the badge + actions; `wizard` shows the ConfigureSSO flow. */
      mode: 'overview' | 'wizard';
      /**
       * Data still cold-loading. The view shows the overview spinner ONLY while
       * `mode === 'overview'`; an open wizard stays mounted regardless so a late
       * `isLoading` flip (e.g. test-runs cold-loading after a configure write) never
       * tears it down — each step owns its own loading UI (legacy `OrganizationSecurityPage`).
       */
      isLoading: boolean;
      organizationName: string;
      /** The derived lifecycle entity the overview view reads its badge/status/domains from. */
      connection: OrganizationEnterpriseConnection;
      /** The raw resource, for the domain chips the overview lists. */
      enterpriseConnection: EnterpriseConnectionResource | undefined;
      openWizard: (forceInitialStep?: boolean) => void;
      exitWizard: () => void;
      overview: OrganizationProfileSecurityOverviewFlow;
      wizard: OrganizationProfileSecurityWizardFlow;
      domainsStep: OrganizationProfileSecurityWizardDomainsStep;
      configureStep: OrganizationProfileSecurityWizardConfigureStep;
    };

/**
 * The single Clerk-facing layer for the Mosaic Security panel. It consumes the umbrella
 * `useOrganizationEnterpriseConnection` hook once, gates on the enterprise-SSO feature flag
 * and the `org:sys_entconns:manage` permission (waiting for full readiness before deciding
 * `hidden`, so the tab never flash-hides), owns the overview + wizard machines, and injects
 * the hook's mutations as plain id-bound functions so the machines stay Clerk-free.
 */
export function useOrganizationProfileSecurityPanelController(): OrganizationProfileSecurityPanelController {
  const gate = useOrganizationProfileSecurityGate();
  const clerk = useClerk();
  const {
    isLoading,
    user,
    organization,
    enterpriseConnection,
    organizationEnterpriseConnection,
    enterpriseConnectionMutations,
    organizationDomains,
    organizationDomainMutations,
  } = useOrganizationEnterpriseConnection();
  const { setConnectionActive, deleteConnection, updateConnection, createConnection, changeProvider } =
    enterpriseConnectionMutations;
  const { createDomain, prepareOwnershipVerification, revalidate } = organizationDomainMutations;
  const connectionStatus = organizationEnterpriseConnection.status;
  const connectionId = enterpriseConnection?.id ?? null;
  const organizationId = organization?.id ?? null;
  const provider = organizationEnterpriseConnection.provider;
  const providerSteps = provider ? CONFIGURE_PROVIDER_STEPS[provider] : [];
  const submitIndex = providerSteps.indexOf(SAML_SUBMIT_STEP_ID);

  // Controller-local, not a machine: a guardless, async-free toggle (per ADOPTION.md).
  const [mode, setMode] = useState<'overview' | 'wizard'>('overview');

  const organizationName = gate.status === 'visible' ? gate.organizationName : '';

  const [overviewSnapshot, sendOverview, overviewActor] = useMachine(organizationProfileSecurityPanelOverviewMachine, {
    context: {
      organizationName,
      activateConnection: async () => {
        if (!enterpriseConnection) {
          return;
        }
        try {
          await setConnectionActive(enterpriseConnection.id, true);
        } catch (err) {
          throw toConnectionError(err);
        }
      },
      deactivateConnection: async () => {
        if (!enterpriseConnection) {
          return;
        }
        try {
          await setConnectionActive(enterpriseConnection.id, false);
        } catch (err) {
          throw toConnectionError(err);
        }
      },
      removeConnection: async () => {
        if (!enterpriseConnection) {
          return;
        }
        try {
          await deleteConnection(enterpriseConnection.id);
        } catch (err) {
          throw toConnectionError(err);
        }
      },
    },
  });

  // Live reachability inputs the wizard's guards read from context. Reseated every
  // render by useMachine; recheck() (below) re-settles the current step when they change.
  const allDomainsVerified = areAllOrganizationDomainsVerified(organizationDomains);
  const { hasConnection, hasMinimumConfiguration, isActive, hasSuccessfulTestRun } = organizationEnterpriseConnection;

  const [wizardSnapshot, sendWizard, wizardActor] = useMachine(organizationProfileSecurityWizardMachine, {
    context: { allDomainsVerified, hasConnection, hasMinimumConfiguration, isActive, hasSuccessfulTestRun },
  });

  // When the connection/domain data changes, re-settle the wizard: a step whose entry
  // guard just broke re-seats to the furthest still-reachable step, and a parked NEXT
  // completes once its target guard opens (replaces the legacy render-phase clamp).
  useEffect(() => {
    wizardActor.recheck();
  }, [wizardActor, allDomainsVerified, hasConnection, hasMinimumConfiguration, isActive, hasSuccessfulTestRun]);

  // The verify-domain step's three concurrent mutations, each its own machine (the
  // domains-section pattern). The injected functions reproduce the legacy handlers 1:1 and
  // normalize errors to plain messages so the machines stay Clerk-free.
  const [domainsAddSnapshot, sendDomainsAdd] = useMachine(organizationProfileSecurityWizardDomainsAddMachine, {
    context: {
      createDomain: async name => {
        try {
          await createDomain(name);
        } catch (err) {
          throw toDomainError(err);
        }
      },
    },
  });

  const [domainsPrepareSnapshot, sendDomainsPrepare] = useMachine(
    organizationProfileSecurityWizardDomainsPrepareMachine,
    {
      context: {
        prepareVerification: async domainId => {
          const domain = organizationDomains?.find(candidate => candidate.id === domainId);
          if (!domain) {
            return;
          }
          try {
            await prepareOwnershipVerification([domain]);
          } catch (err) {
            throw toDomainError(err);
          }
        },
      },
    },
  );

  const [domainsRemoveSnapshot, sendDomainsRemove] = useMachine(organizationProfileSecurityWizardDomainsRemoveMachine, {
    context: {
      // Reproduces legacy `handleRemoveDomain`: drop the domain from the connection, delete the
      // domain, then revalidate. Errors surface as the dialog's global error (legacy `handleError`).
      removeDomain: async domainName => {
        const domain = organizationDomains?.find(candidate => candidate.name === domainName);
        try {
          if (enterpriseConnection) {
            const domains = enterpriseConnection.domains.filter(name => name !== domainName);
            await updateConnection(enterpriseConnection.id, { domains });
          }
          await domain?.delete();
          await revalidate();
        } catch (err) {
          throw toConnectionError(err);
        }
      },
    },
  });

  // The `configure` step: the collapsed middle + inner SAML wizard. Injected mutations reproduce
  // the legacy select-provider (`createConnection` / `changeProvider`, global error) and the SAML
  // save (`updateConnection` with the `saml` payload, field-first error) 1:1.
  const [configureSnapshot, sendConfigure, configureActor] = useMachine(
    organizationProfileSecurityWizardConfigureMachine,
    {
      context: {
        providerSteps,
        submitIndex,
        hasConnection,
        createConnection: async selected => {
          try {
            await createConnection(selected);
          } catch (err) {
            throw toConnectionError(err);
          }
        },
        changeProvider: async selected => {
          try {
            await changeProvider(selected);
          } catch (err) {
            throw toConnectionError(err);
          }
        },
        updateConnection: async payload => {
          if (!enterpriseConnection) {
            return;
          }
          try {
            await updateConnection(enterpriseConnection.id, { saml: payload });
          } catch (err) {
            throw toDomainError(err);
          }
        },
      },
    },
  );

  // Same live-data recheck as the outer wizard: a create/change advance parked on a stale
  // `hasConnection` completes once the fresh value lands, and a footer Reset that deleted the
  // connection re-seats `configuring` back to `selecting`.
  useEffect(() => {
    configureActor.recheck();
    // `provider` (stable) is the source of `providerSteps` / `submitIndex`; keying on it avoids the
    // fresh-`[]`-every-render churn that depending on the derived array would cause.
  }, [configureActor, hasConnection, provider, submitIndex]);

  // The terminal SAML save's bubble to the outer wizard. The configure machine cannot reach the
  // outer actor, so it rests in `bubblingNext`; on the rising edge into that state the controller
  // forwards a single outer `NEXT` (which the outer wizard defers to `test` via its own
  // `pendingNext`). One-shot via the ref so a re-render never double-advances the outer wizard.
  const bubbledRef = useRef(false);
  useEffect(() => {
    if (configureSnapshot.value === 'bubblingNext') {
      if (!bubbledRef.current) {
        bubbledRef.current = true;
        sendWizard({ type: 'NEXT' });
      }
    } else {
      bubbledRef.current = false;
    }
  }, [configureSnapshot.value, sendWizard]);

  // Fired once when the verify-domain step mounts (legacy `eventFlowStepMounted`).
  const onDomainsStepMounted = useCallback(() => {
    clerk.telemetry?.record(
      eventFlowStepMounted('configureSSO', 'verify-domain', {
        timestamp: new Date().toISOString(),
        connectionStatus,
        connectionId,
        organizationId,
      }),
    );
  }, [clerk, connectionStatus, connectionId, organizationId]);

  // The gate (above) already waited for full readiness before deciding; a non-visible
  // gate maps straight through to the panel's loading/hidden status.
  if (gate.status !== 'visible') {
    return { status: gate.status };
  }

  return {
    status: 'ready',
    mode,
    isLoading,
    organizationName: gate.organizationName,
    connection: organizationEnterpriseConnection,
    enterpriseConnection,
    // `forceInitialStep` seats the wizard at the first step (legacy Start / Edit); otherwise
    // it resumes wherever the actor's furthest-reachable seat left it (legacy Continue).
    openWizard: (forceInitialStep = false) => {
      if (forceInitialStep) {
        sendWizard({ type: 'GOTO', step: 'verify-domain' });
      }
      setMode('wizard');
    },
    exitWizard: () => setMode('overview'),
    overview: {
      snapshot: overviewSnapshot,
      send: sendOverview,
      canConfirmRemove: overviewActor.can({ type: 'CONFIRM_REMOVE' }),
    },
    wizard: {
      snapshot: wizardSnapshot,
      send: sendWizard,
    },
    domainsStep: {
      domains: organizationDomains,
      suggestedDomain: emailDomain(user?.primaryEmailAddress?.emailAddress),
      hasConnection,
      isConnectionActive: isActive,
      add: { snapshot: domainsAddSnapshot, send: sendDomainsAdd },
      prepare: { snapshot: domainsPrepareSnapshot, send: sendDomainsPrepare },
      remove: { snapshot: domainsRemoveSnapshot, send: sendDomainsRemove },
      onStepMounted: onDomainsStepMounted,
    },
    configureStep: {
      snapshot: configureSnapshot,
      send: sendConfigure,
      provider,
      providerSteps,
      submitStepId: SAML_SUBMIT_STEP_ID,
      enteredForward: wizardSnapshot.context.direction === 1,
      onParentNext: () => sendWizard({ type: 'NEXT' }),
      onParentPrev: () => sendWizard({ type: 'PREV' }),
    },
  };
}
