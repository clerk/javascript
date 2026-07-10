/** @jsxImportSource @emotion/react */
import type { OrganizationDomainResource } from '@clerk/shared/types';
import { useMachine } from '@clerk/ui/mosaic/machine/useMachine';
import type { OrganizationProfileSecurityPanelViewProps } from '@clerk/ui/mosaic/organization/organization-profile-security-panel.view';
import { OrganizationProfileSecurityPanelView } from '@clerk/ui/mosaic/organization/organization-profile-security-panel.view';
import { organizationProfileSecurityPanelOverviewMachine } from '@clerk/ui/mosaic/organization/organization-profile-security-panel-overview.machine';
import { organizationProfileSecurityWizardMachine } from '@clerk/ui/mosaic/organization/organization-profile-security-wizard.machine';
import { organizationProfileSecurityWizardActivateMachine } from '@clerk/ui/mosaic/organization/organization-profile-security-wizard-activate.machine';
import {
  CONFIGURE_PROVIDER_STEPS,
  organizationProfileSecurityWizardConfigureMachine,
  SAML_SUBMIT_STEP_ID,
} from '@clerk/ui/mosaic/organization/organization-profile-security-wizard-configure.machine';
import { organizationProfileSecurityWizardDomainsAddMachine } from '@clerk/ui/mosaic/organization/organization-profile-security-wizard-domains-add.machine';
import { organizationProfileSecurityWizardDomainsPrepareMachine } from '@clerk/ui/mosaic/organization/organization-profile-security-wizard-domains-prepare.machine';
import { organizationProfileSecurityWizardDomainsRemoveMachine } from '@clerk/ui/mosaic/organization/organization-profile-security-wizard-domains-remove.machine';
import { organizationProfileSecurityWizardTestMachine } from '@clerk/ui/mosaic/organization/organization-profile-security-wizard-test.machine';
import { useEffect, useRef, useState } from 'react';

import type { StoryMeta } from '@/lib/types';

export const meta: StoryMeta = {
  group: 'Organization',
  title: 'OrganizationProfileSecurityPanel',
  source: 'packages/ui/src/mosaic/organization/organization-profile-security-panel.tsx',
};

// Demo async deps: resolve after a short delay so the in-flight (busy) states are visible.
const delay = () => new Promise<void>(resolve => setTimeout(resolve, 600));

// An active connection so the overview shows the full state (Active badge, domain chips, the
// Edit / Deactivate / Remove actions). Click Edit to open the ConfigureSSO wizard.
const DEMO_PROVIDER = 'saml_okta' as const;
const DEMO_CONNECTION: OrganizationProfileSecurityPanelViewProps['connection'] = {
  provider: DEMO_PROVIDER,
  hasConnection: true,
  isActive: true,
  hasMinimumConfiguration: true,
  hasSuccessfulTestRun: true,
  status: 'active',
};

// The view reads only id/name/verification for the chips, so a partial fixture is enough. The
// cast is confined to this swingset demo fixture (matching the domains-section story).
const DEMO_DOMAINS = [
  { id: 'dmn_1', name: 'acme.com', verification: { status: 'verified' } },
  { id: 'dmn_2', name: 'acme.dev', verification: { status: 'verified' } },
] as unknown as OrganizationDomainResource[];

export function Default() {
  // Controller-local in the real panel; here a plain toggle the overview/wizard actions drive.
  const [mode, setMode] = useState<'overview' | 'wizard'>('overview');

  const [overviewSnapshot, sendOverview, overviewActor] = useMachine(organizationProfileSecurityPanelOverviewMachine, {
    context: {
      organizationName: 'Acme Inc',
      activateConnection: delay,
      deactivateConnection: delay,
      removeConnection: delay,
    },
  });

  const [wizardSnapshot, sendWizard] = useMachine(organizationProfileSecurityWizardMachine, {
    context: {
      allDomainsVerified: true,
      hasConnection: true,
      hasMinimumConfiguration: true,
      isActive: true,
      hasSuccessfulTestRun: true,
    },
  });

  const [domainsAddSnapshot, sendDomainsAdd] = useMachine(organizationProfileSecurityWizardDomainsAddMachine, {
    context: { createDomain: delay },
  });
  const [domainsPrepareSnapshot, sendDomainsPrepare] = useMachine(
    organizationProfileSecurityWizardDomainsPrepareMachine,
    { context: { prepareVerification: delay } },
  );
  const [domainsRemoveSnapshot, sendDomainsRemove] = useMachine(organizationProfileSecurityWizardDomainsRemoveMachine, {
    context: { removeDomain: delay },
  });

  const providerSteps = CONFIGURE_PROVIDER_STEPS[DEMO_PROVIDER];
  const [configureSnapshot, sendConfigure] = useMachine(organizationProfileSecurityWizardConfigureMachine, {
    context: {
      providerSteps,
      submitIndex: providerSteps.indexOf(SAML_SUBMIT_STEP_ID),
      hasConnection: true,
      createConnection: delay,
      changeProvider: delay,
      updateConnection: delay,
    },
  });

  const [testSnapshot, sendTest] = useMachine(organizationProfileSecurityWizardTestMachine, {
    context: {
      hasSuccessfulTestRun: true,
      noSuccessfulRunMessage: 'Run a test and complete it successfully before continuing.',
      createTestRun: delay,
      revalidateHasSuccessfulTestRun: async () => {
        await delay();
        return true;
      },
    },
  });

  const [activateSnapshot, sendActivate] = useMachine(organizationProfileSecurityWizardActivateMachine, {
    context: { isActive: true, activateConnection: delay },
  });

  // The controller forwards a configure/test terminal-save bubble to the outer wizard on the rising
  // edge into `bubblingNext`; mirror that here so the wizard advances in the demo. One-shot via ref.
  const configureBubbled = useRef(false);
  useEffect(() => {
    if (configureSnapshot.value === 'bubblingNext') {
      if (!configureBubbled.current) {
        configureBubbled.current = true;
        sendWizard({ type: 'NEXT' });
      }
    } else {
      configureBubbled.current = false;
    }
  }, [configureSnapshot.value, sendWizard]);

  const testBubbled = useRef(false);
  useEffect(() => {
    if (testSnapshot.value === 'bubblingNext') {
      if (!testBubbled.current) {
        testBubbled.current = true;
        sendWizard({ type: 'NEXT' });
      }
    } else {
      testBubbled.current = false;
    }
  }, [testSnapshot.value, sendWizard]);

  // A completed activate returns the panel to the overview (controller's `activated` → overview).
  useEffect(() => {
    if (activateSnapshot.value === 'activated') {
      setMode('overview');
    }
  }, [activateSnapshot.value]);

  return (
    <OrganizationProfileSecurityPanelView
      mode={mode}
      isLoading={false}
      organizationName='Acme Inc'
      connection={DEMO_CONNECTION}
      enterpriseConnection={{ domains: ['acme.com', 'acme.dev'] }}
      openWizard={(forceInitialStep = false) => {
        if (forceInitialStep) {
          sendWizard({ type: 'GOTO', step: 'verify-domain' });
        }
        setMode('wizard');
      }}
      exitWizard={() => setMode('overview')}
      overview={{
        snapshot: overviewSnapshot,
        send: sendOverview,
        canConfirmRemove: overviewActor.can({ type: 'CONFIRM_REMOVE' }),
      }}
      wizard={{ snapshot: wizardSnapshot, send: sendWizard }}
      domainsStep={{
        domains: DEMO_DOMAINS,
        suggestedDomain: 'acme.io',
        hasConnection: true,
        isConnectionActive: true,
        add: { snapshot: domainsAddSnapshot, send: sendDomainsAdd },
        prepare: { snapshot: domainsPrepareSnapshot, send: sendDomainsPrepare },
        remove: { snapshot: domainsRemoveSnapshot, send: sendDomainsRemove },
        onStepMounted: () => {},
      }}
      configureStep={{
        snapshot: configureSnapshot,
        send: sendConfigure,
        provider: DEMO_PROVIDER,
        providerSteps,
        submitStepId: SAML_SUBMIT_STEP_ID,
        enteredForward: wizardSnapshot.context.direction === 1,
        onParentNext: () => sendWizard({ type: 'NEXT' }),
        onParentPrev: () => sendWizard({ type: 'PREV' }),
      }}
      testStep={{
        snapshot: testSnapshot,
        send: sendTest,
        testRuns: {
          rows: [],
          totalCount: 0,
          isLoading: false,
          isFetching: false,
          isPolling: false,
          page: 1,
          setPage: () => {},
          refresh: async () => {},
          revalidateHasSuccessfulTestRun: async () => true,
        },
        onParentPrev: () => sendWizard({ type: 'PREV' }),
      }}
      activateStep={{
        snapshot: activateSnapshot,
        send: sendActivate,
        isActive: true,
        domain: 'acme.com, acme.dev',
        onExit: () => setMode('overview'),
      }}
    />
  );
}
