import type { EnterpriseConnectionResource } from '@clerk/shared/types';

import type {
  OrganizationEnterpriseConnection,
  OrganizationEnterpriseConnectionStatus,
} from '@/components/ConfigureSSO/domain/organizationEnterpriseConnection';

import { Destructive } from '../block/destructive';
import { Box } from '../components/box';
import { Button } from '../components/button';
import { Heading } from '../components/heading';
import { Skeleton } from '../components/skeleton';
import { Text } from '../components/text';
import type { Snapshot } from '../machine/types';
import type {
  OrganizationProfileSecurityWizardConfigureStep,
  OrganizationProfileSecurityWizardDomainsStep,
} from './organization-profile-security-panel.controller';
import type {
  OrganizationProfileSecurityPanelOverviewContext,
  OrganizationProfileSecurityPanelOverviewEvent,
} from './organization-profile-security-panel-overview.machine';
import type {
  OrganizationProfileSecurityWizardContext,
  OrganizationProfileSecurityWizardEvent,
  SecurityWizardStepId,
} from './organization-profile-security-wizard.machine';
import {
  isSecurityWizardStepComplete,
  isSecurityWizardStepReachable,
  SECURITY_WIZARD_STEP_LABELS,
  SECURITY_WIZARD_STEP_ORDER,
} from './organization-profile-security-wizard.machine';
import { OrganizationProfileSecurityWizardConfigureView } from './organization-profile-security-wizard-configure.view';
import { OrganizationProfileSecurityWizardDomainsView } from './organization-profile-security-wizard-domains.view';

/**
 * The Mosaic Security panel view — pure rendering over the controller's snapshots.
 *
 * It renders the SSO overview (`mode === 'overview'`) or the ConfigureSSO wizard shell
 * (`mode === 'wizard'`). Every string here matches the legacy `securityPage.*`
 * localization values 1:1 (`SecuritySsoSection.tsx`); the Mosaic panels render plain
 * English rather than `localizationKeys`, matching the other migrated sections.
 *
 * The legacy three-dot menu (Edit / Activate|Deactivate / Remove) is flattened into
 * inline action buttons — the same actions and events, matching the domains-section
 * migration. The enrollment-role tooltip is not rendered yet: the controller does not
 * expose the derived role label (a tracked Phase-1 item), so it is deferred rather than
 * approximated.
 */

interface OverviewFlow {
  snapshot: Snapshot<OrganizationProfileSecurityPanelOverviewContext>;
  send: (event: OrganizationProfileSecurityPanelOverviewEvent) => void;
  /** Whether the typed confirmation currently matches the org name (the remove guard). */
  canConfirmRemove: boolean;
}

interface WizardFlow {
  snapshot: Snapshot<OrganizationProfileSecurityWizardContext>;
  send: (event: OrganizationProfileSecurityWizardEvent) => void;
}

export interface OrganizationProfileSecurityPanelViewProps {
  mode: 'overview' | 'wizard';
  isLoading: boolean;
  organizationName: string;
  connection: OrganizationEnterpriseConnection;
  /** Narrowed to what the view reads (the domain chips); the controller passes the full resource. */
  enterpriseConnection: Pick<EnterpriseConnectionResource, 'domains'> | undefined;
  openWizard: (forceInitialStep?: boolean) => void;
  exitWizard: () => void;
  overview: OverviewFlow;
  wizard: WizardFlow;
  domainsStep: OrganizationProfileSecurityWizardDomainsStep;
  configureStep: OrganizationProfileSecurityWizardConfigureStep;
}

const STATUS_LABEL: Record<OrganizationEnterpriseConnectionStatus, string> = {
  unconfigured: 'Unconfigured',
  in_progress: 'In Progress',
  active: 'Active',
  inactive: 'Inactive',
};

/** The connection description; legacy `ssoSection.descriptionLine1`. */
const SSO_DESCRIPTION = 'Require members with a matching email domain to sign in through your identity provider.';

type BadgeTone = 'neutral' | 'emphasis' | 'destructive';

/**
 * The status badge tone. The Mosaic palette has no success/warning tokens, so the
 * legacy success/warning/danger color schemes collapse onto the available tokens; the
 * badge *label* (which the functional spec asserts) still matches legacy exactly.
 */
const STATUS_TONE: Record<OrganizationEnterpriseConnectionStatus, BadgeTone> = {
  unconfigured: 'neutral',
  in_progress: 'neutral',
  active: 'emphasis',
  inactive: 'destructive',
};

function Badge({ children, tone = 'neutral' }: { children: React.ReactNode; tone?: BadgeTone }) {
  return (
    <Box
      render={p => <span {...p} />}
      sx={t => ({
        display: 'inline-flex',
        alignItems: 'center',
        ...t.text('xs'),
        fontWeight: t.font.medium,
        paddingInline: t.spacing(1.5),
        paddingBlock: t.spacing(0.5),
        borderRadius: t.rounded.full,
        color:
          tone === 'destructive'
            ? t.color.destructive
            : tone === 'emphasis'
              ? t.color.primary
              : t.color.mutedForeground,
        backgroundColor:
          tone === 'destructive'
            ? t.alpha('destructive', 12)
            : tone === 'emphasis'
              ? t.alpha('primary', 12)
              : t.alpha('primary', 8),
      })}
    >
      {children}
    </Box>
  );
}

function SectionHeader({ status }: { status: OrganizationEnterpriseConnectionStatus }) {
  return (
    <Box sx={t => ({ display: 'flex', alignItems: 'center', gap: t.spacing(2) })}>
      <Heading size='base'>SSO</Heading>
      <Badge tone={STATUS_TONE[status]}>{STATUS_LABEL[status]}</Badge>
    </Box>
  );
}

function Description() {
  return (
    <Text
      render={p => <p {...p} />}
      intent='mutedForeground'
      sx={t => ({ textWrap: 'balance', marginBlockStart: t.spacing(1) })}
    >
      {SSO_DESCRIPTION}
    </Text>
  );
}

function DomainChips({ domains }: { domains: string[] }) {
  if (domains.length === 0) {
    return null;
  }
  return (
    <Box sx={t => ({ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: t.spacing(1.5) })}>
      <Text
        render={p => <span {...p} />}
        intent='mutedForeground'
      >
        Domains:
      </Text>
      {domains.map(domain => (
        <Badge key={domain}>{domain}</Badge>
      ))}
    </Box>
  );
}

function OverviewContent({
  organizationName,
  connection,
  enterpriseConnection,
  openWizard,
  overview,
}: Pick<
  OrganizationProfileSecurityPanelViewProps,
  'organizationName' | 'connection' | 'enterpriseConnection' | 'openWizard' | 'overview'
>) {
  const { snapshot, send, canConfirmRemove } = overview;
  const status = connection.status;
  const isConfigured = status === 'active' || status === 'inactive';
  const isActive = status === 'active';
  const isMutating = snapshot.value === 'activating' || snapshot.value === 'deactivating';
  const isRemoving = snapshot.value === 'removing';
  const isRemoveOpen = snapshot.value === 'confirmingRemove' || isRemoving;
  const domains = enterpriseConnection?.domains ?? [];
  // The remove dialog owns the error while it is open; otherwise a mutation error
  // (activate/deactivate) shows in the section-level alert (legacy `Card.Alert`).
  const sectionError = !isRemoveOpen ? snapshot.context.error : null;

  return (
    <Box sx={t => ({ display: 'flex', flexDirection: 'column', gap: t.spacing(4) })}>
      <SectionHeader status={status} />
      <Description />

      {status === 'unconfigured' && (
        <Button
          type='button'
          variant='outline'
          size='sm'
          onClick={() => openWizard(true)}
          sx={{ alignSelf: 'flex-start' }}
        >
          Start configuration
        </Button>
      )}

      {status === 'in_progress' && (
        <Button
          type='button'
          variant='outline'
          size='sm'
          onClick={() => openWizard()}
          sx={{ alignSelf: 'flex-start' }}
        >
          Continue configuration
        </Button>
      )}

      {isConfigured && (
        <>
          <Box sx={t => ({ display: 'flex', alignItems: 'center', gap: t.spacing(2) })}>
            <Button
              type='button'
              variant='outline'
              size='sm'
              onClick={() => openWizard(true)}
            >
              Edit
            </Button>
            <Button
              type='button'
              variant='outline'
              size='sm'
              disabled={isMutating}
              onClick={() => send({ type: isActive ? 'DEACTIVATE' : 'ACTIVATE' })}
            >
              {isActive ? 'Deactivate' : 'Activate'}
            </Button>
            <Destructive
              trigger={props => (
                <Button
                  {...props}
                  type='button'
                  variant='ghost'
                  size='sm'
                  intent='destructive'
                >
                  Remove
                </Button>
              )}
              open={isRemoveOpen}
              onOpenChange={isOpen => send({ type: isOpen ? 'OPEN_REMOVE' : 'CANCEL_REMOVE' })}
              title='Remove SSO connection'
              description='Are you sure you want to remove the connection? This action is irreversible and deletes the connection and all of its configuration.'
              resourceName={organizationName}
              confirmationValue={snapshot.context.confirmationValue}
              onConfirmationValueChange={value => send({ type: 'TYPE_CONFIRMATION', value })}
              primaryActionLabel='Remove connection'
              onDelete={() => send({ type: 'CONFIRM_REMOVE' })}
              isDeleting={isRemoving}
              canSubmit={canConfirmRemove}
              error={snapshot.context.error}
            />
          </Box>

          {sectionError && (
            <Text
              render={p => (
                <p
                  role='alert'
                  {...p}
                />
              )}
              intent='destructive'
            >
              {sectionError}
            </Text>
          )}

          <DomainChips domains={domains} />
        </>
      )}
    </Box>
  );
}

/**
 * The ConfigureSSO wizard shell: a breadcrumb of the four steps (from the machine's step
 * order/labels, gated by live reachability + completion), the current step body, and the
 * NEXT/PREV nav. The step bodies are placeholders for now — Phase 3 swaps in the per-step
 * views. Navigation is functional: the breadcrumb sends GOTO (reachable steps only), and
 * Back/Continue send PREV/NEXT bounded by the first/last positions.
 *
 * The controller owns the machine (furthest-reachable seat, recheck, deferred advance);
 * this layer only reads the snapshot and sends events.
 */
function WizardBreadcrumb({
  current,
  context,
  send,
}: {
  current: SecurityWizardStepId;
  context: OrganizationProfileSecurityWizardContext;
  send: WizardFlow['send'];
}) {
  return (
    <Box
      render={p => <nav {...p} />}
      aria-label='SSO configuration steps'
      sx={t => ({ display: 'flex', flexWrap: 'wrap', gap: t.spacing(2) })}
    >
      {SECURITY_WIZARD_STEP_ORDER.map((step, index) => {
        const reachable = isSecurityWizardStepReachable(step, context);
        const complete = isSecurityWizardStepComplete(step, context);
        const isCurrent = step === current;
        return (
          <Button
            key={step}
            type='button'
            variant={isCurrent ? 'outline' : 'ghost'}
            size='sm'
            disabled={!reachable || isCurrent}
            aria-current={isCurrent ? 'step' : undefined}
            onClick={() => send({ type: 'GOTO', step })}
          >
            {index + 1}. {SECURITY_WIZARD_STEP_LABELS[step]}
            {complete ? ' ✓' : ''}
          </Button>
        );
      })}
    </Box>
  );
}

function WizardStepBody({
  current,
  domainsStep,
  configureStep,
}: {
  current: SecurityWizardStepId;
  domainsStep: OrganizationProfileSecurityWizardDomainsStep;
  configureStep: OrganizationProfileSecurityWizardConfigureStep;
}) {
  if (current === 'verify-domain') {
    return (
      <OrganizationProfileSecurityWizardDomainsView
        domains={domainsStep.domains}
        suggestedDomain={domainsStep.suggestedDomain}
        hasConnection={domainsStep.hasConnection}
        isConnectionActive={domainsStep.isConnectionActive}
        add={domainsStep.add}
        prepare={domainsStep.prepare}
        remove={domainsStep.remove}
        onStepMounted={domainsStep.onStepMounted}
      />
    );
  }

  if (current === 'configure') {
    return <OrganizationProfileSecurityWizardConfigureView configure={configureStep} />;
  }

  // Steps test / activate land here until their Phase-3 views are built.
  return (
    <Text
      render={p => <p {...p} />}
      data-testid='security-wizard-step'
    >
      {current}
    </Text>
  );
}

function WizardShell({
  wizard,
  exitWizard,
  domainsStep,
  configureStep,
}: Pick<OrganizationProfileSecurityPanelViewProps, 'wizard' | 'exitWizard' | 'domainsStep' | 'configureStep'>) {
  const { snapshot, send } = wizard;
  // The machine's state values are the step ids; resolve through the known order so
  // `current` is a typed SecurityWizardStepId without a cast.
  const current = SECURITY_WIZARD_STEP_ORDER.find(step => step === snapshot.value) ?? SECURITY_WIZARD_STEP_ORDER[0];
  const index = SECURITY_WIZARD_STEP_ORDER.indexOf(current);
  const isFirst = index <= 0;
  const isLast = index === SECURITY_WIZARD_STEP_ORDER.length - 1;
  // The configure step drives its own inner nav (select-provider + SAML sub-flow) and bubbles to
  // the outer wizard itself, so the shell's generic Back/Continue is suppressed there — otherwise
  // it would advance the outer wizard past the inner flow.
  const stepOwnsNav = current === 'configure';

  return (
    <Box sx={t => ({ display: 'flex', flexDirection: 'column', gap: t.spacing(4) })}>
      <Button
        type='button'
        variant='ghost'
        size='sm'
        onClick={exitWizard}
        sx={{ alignSelf: 'flex-start' }}
      >
        Back to overview
      </Button>

      <WizardBreadcrumb
        current={current}
        context={snapshot.context}
        send={send}
      />

      <WizardStepBody
        current={current}
        domainsStep={domainsStep}
        configureStep={configureStep}
      />

      {!stepOwnsNav && (
        <Box sx={t => ({ display: 'flex', gap: t.spacing(2) })}>
          <Button
            type='button'
            variant='outline'
            size='sm'
            disabled={isFirst}
            onClick={() => send({ type: 'PREV' })}
          >
            Back
          </Button>
          <Button
            type='button'
            size='sm'
            disabled={isLast}
            onClick={() => send({ type: 'NEXT' })}
          >
            Continue
          </Button>
        </Box>
      )}
    </Box>
  );
}

export function OrganizationProfileSecurityPanelView(props: OrganizationProfileSecurityPanelViewProps) {
  const { mode, isLoading } = props;

  return (
    <Box sx={{ width: '100%', containerType: 'inline-size' }}>
      {mode === 'wizard' ? (
        <WizardShell
          wizard={props.wizard}
          exitWizard={props.exitWizard}
          domainsStep={props.domainsStep}
          configureStep={props.configureStep}
        />
      ) : isLoading ? (
        <Box sx={t => ({ display: 'flex', flexDirection: 'column', gap: t.spacing(2) })}>
          <Skeleton
            width='8rem'
            height='1.5rem'
          />
          <Skeleton
            width='100%'
            height='2.5rem'
          />
        </Box>
      ) : (
        <OverviewContent
          organizationName={props.organizationName}
          connection={props.connection}
          enterpriseConnection={props.enterpriseConnection}
          openWizard={props.openWizard}
          overview={props.overview}
        />
      )}
    </Box>
  );
}
