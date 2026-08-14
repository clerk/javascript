import type { OrganizationDomainResource } from '@clerk/shared/types';
import { useEffect, useRef, useState } from 'react';

import { Box } from '../components/box';
import { Button } from '../components/button';
import { Dialog } from '../components/dialog';
import { Heading } from '../components/heading';
import { Icon } from '../components/icon';
import { Input } from '../components/input';
import { Text } from '../components/text';
import type { Snapshot } from '../machine/types';
import type {
  OrganizationProfileSecurityWizardDomainsAddContext,
  OrganizationProfileSecurityWizardDomainsAddEvent,
} from './organization-profile-security-wizard-domains-add.machine';
import { isValidDomain } from './organization-profile-security-wizard-domains-add.machine';
import type {
  OrganizationProfileSecurityWizardDomainsPrepareContext,
  OrganizationProfileSecurityWizardDomainsPrepareEvent,
} from './organization-profile-security-wizard-domains-prepare.machine';
import type {
  OrganizationProfileSecurityWizardDomainsRemoveContext,
  OrganizationProfileSecurityWizardDomainsRemoveEvent,
} from './organization-profile-security-wizard-domains-remove.machine';

/**
 * The verify-domain step body, ported 1:1 from `OrganizationDomainsStep.tsx`.
 *
 * Three independent, concurrent mutations, each its own small machine (matching the
 * domains-section pattern): add a domain, re-prepare an expired domain, remove a domain.
 * The add error and the prepare error share the single alert legacy rendered under the field
 * (`card.error`); the view shows the add error first, then the prepare error.
 *
 * The DNS TXT-record layout, clipboard affordance, and card animations from the legacy view
 * are intentionally simplified to their functional essentials for now — the wizard views are
 * slated for a later visual pass. Copy matches the legacy `configureSSO.organizationDomainsStep.*`
 * values.
 */

interface AddFlow {
  snapshot: Snapshot<OrganizationProfileSecurityWizardDomainsAddContext>;
  send: (event: OrganizationProfileSecurityWizardDomainsAddEvent) => void;
}

interface PrepareFlow {
  snapshot: Snapshot<OrganizationProfileSecurityWizardDomainsPrepareContext>;
  send: (event: OrganizationProfileSecurityWizardDomainsPrepareEvent) => void;
}

interface RemoveFlow {
  snapshot: Snapshot<OrganizationProfileSecurityWizardDomainsRemoveContext>;
  send: (event: OrganizationProfileSecurityWizardDomainsRemoveEvent) => void;
}

export interface OrganizationProfileSecurityWizardDomainsViewProps {
  domains: OrganizationDomainResource[] | undefined;
  /** The user's email domain, offered as a one-click add while the list is empty. */
  suggestedDomain: string | null;
  /** Whether a connection exists — locks the last remaining verified domain from removal. */
  hasConnection: boolean;
  /** Whether the connection is active — selects the remove dialog subtitle copy. */
  isConnectionActive: boolean;
  add: AddFlow;
  prepare: PrepareFlow;
  remove: RemoveFlow;
  /** Fired once on mount to emit the legacy `eventFlowStepMounted` telemetry. */
  onStepMounted: () => void;
}

const domainStatus = (domain: OrganizationDomainResource): 'verified' | 'expired' | 'unverified' => {
  const status = domain.ownershipVerification?.status;
  if (status === 'verified') {
    return 'verified';
  }
  if (status === 'expired') {
    return 'expired';
  }
  return 'unverified';
};

function AddField({ add, domains }: { add: AddFlow; domains: OrganizationDomainResource[] | undefined }) {
  const { snapshot, send } = add;
  const draft = snapshot.context.draftName;
  const isCreating = snapshot.value === 'creating';
  const normalized = draft.trim().toLowerCase();
  const isDuplicate = domains?.some(d => d.name === normalized) ?? false;
  const canSubmit = isValidDomain(draft) && !isDuplicate && !isCreating;

  return (
    <Box
      render={p => <form {...p} />}
      onSubmit={event => {
        event.preventDefault();
        if (canSubmit) {
          send({ type: 'SUBMIT', name: draft });
        }
      }}
      sx={t => ({ display: 'flex', alignItems: 'flex-start', gap: t.spacing(2) })}
    >
      <Box sx={{ flex: 1 }}>
        <Input
          aria-label='Domain'
          placeholder='example.com'
          value={draft}
          disabled={isCreating}
          onChange={event => send({ type: 'TYPE_NAME', value: event.target.value })}
        />
      </Box>
      <Button
        type='submit'
        variant='outline'
        size='md'
        disabled={!canSubmit}
      >
        Add
      </Button>
    </Box>
  );
}

function DomainSuggestion({ add, suggestedDomain }: { add: AddFlow; suggestedDomain: string }) {
  const [isDismissed, setIsDismissed] = useState(false);
  const isCreating = add.snapshot.value === 'creating';

  if (isDismissed) {
    return null;
  }

  return (
    <Box
      sx={t => ({
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: t.spacing(2),
        paddingInline: t.spacing(3),
        paddingBlock: t.spacing(1.5),
        border: `1px solid ${t.alpha('primary', 15)}`,
        borderRadius: t.rounded.lg,
        backgroundColor: t.alpha('primary', 5),
      })}
    >
      <Text
        render={p => <span {...p} />}
        intent='mutedForeground'
      >
        Add {suggestedDomain}?
      </Text>
      <Box sx={t => ({ display: 'flex', alignItems: 'center', gap: t.spacing(2) })}>
        <Button
          type='button'
          variant='outline'
          size='sm'
          disabled={isCreating}
          onClick={() => add.send({ type: 'SUBMIT', name: suggestedDomain })}
        >
          Add {suggestedDomain}
        </Button>
        <Button
          type='button'
          variant='ghost'
          size='sm'
          aria-label='Dismiss domain suggestion'
          disabled={isCreating}
          onClick={() => setIsDismissed(true)}
        >
          <Icon name='close' />
        </Button>
      </Box>
    </Box>
  );
}

function TxtRecord({ domain }: { domain: OrganizationDomainResource }) {
  const record = domain.ownershipVerification;
  return (
    <Box sx={t => ({ display: 'flex', flexDirection: 'column', gap: t.spacing(2), marginBlockStart: t.spacing(2) })}>
      <Text
        render={p => <p {...p} />}
        intent='mutedForeground'
      >
        Add the following TXT record to your DNS configuration to verify ownership.
      </Text>
      <Box sx={t => ({ display: 'flex', flexWrap: 'wrap', gap: t.spacing(4) })}>
        <RecordEntry
          label='Type'
          value='TXT'
        />
        <RecordEntry
          label='Host'
          value={record?.txtRecordName ?? '@'}
        />
        <RecordEntry
          label='Value'
          value={record?.txtRecordValue ?? '—'}
        />
      </Box>
    </Box>
  );
}

function RecordEntry({ label, value }: { label: string; value: string }) {
  return (
    <Box sx={t => ({ display: 'flex', alignItems: 'center', gap: t.spacing(2), minWidth: 0 })}>
      <Text
        render={p => <span {...p} />}
        intent='mutedForeground'
      >
        {label}
      </Text>
      <Box
        render={p => <code {...p} />}
        sx={t => ({ ...t.text('sm'), paddingInline: t.spacing(1.5), paddingBlock: t.spacing(0.5) })}
      >
        {value}
      </Box>
    </Box>
  );
}

function DomainCard({
  domain,
  prepare,
  onRemove,
  isRemoveDisabled,
}: {
  domain: OrganizationDomainResource;
  prepare: PrepareFlow;
  onRemove: () => void;
  isRemoveDisabled: boolean;
}) {
  const status = domainStatus(domain);
  const isPreparing = prepare.snapshot.value === 'preparing' && prepare.snapshot.context.pendingDomainId === domain.id;

  return (
    <Box
      sx={t => ({
        display: 'flex',
        flexDirection: 'column',
        gap: t.spacing(2),
        padding: t.spacing(3),
        border: `1px solid ${t.alpha('primary', 15)}`,
        borderRadius: t.rounded.lg,
      })}
    >
      <Box sx={t => ({ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: t.spacing(2) })}>
        <Box sx={t => ({ display: 'flex', alignItems: 'center', gap: t.spacing(2), minWidth: 0 })}>
          <Text
            render={p => <span {...p} />}
            sx={t => ({ fontWeight: t.font.medium })}
          >
            {domain.name}
          </Text>
          <Text
            render={p => <span {...p} />}
            intent={status === 'verified' ? 'mutedForeground' : 'destructive'}
          >
            {status === 'verified' ? 'Verified' : status === 'expired' ? 'Expired' : 'Unverified'}
          </Text>
        </Box>
        <Button
          type='button'
          variant='ghost'
          size='sm'
          aria-label={`Remove ${domain.name}`}
          disabled={isRemoveDisabled}
          onClick={onRemove}
        >
          <Icon name='close' />
        </Button>
      </Box>

      {status === 'expired' ? (
        <Box sx={t => ({ display: 'flex', flexDirection: 'column', gap: t.spacing(2) })}>
          <Text
            render={p => <p {...p} />}
            intent='mutedForeground'
          >
            The verification for this domain has expired. Verify it again to continue.
          </Text>
          <Button
            type='button'
            variant='outline'
            size='sm'
            disabled={isPreparing}
            onClick={() => prepare.send({ type: 'PREPARE', domainId: domain.id })}
            sx={{ alignSelf: 'flex-start' }}
          >
            Verify again
          </Button>
        </Box>
      ) : status === 'unverified' ? (
        <TxtRecord domain={domain} />
      ) : null}
    </Box>
  );
}

function RemoveDialog({ remove }: { remove: RemoveFlow }) {
  const { snapshot, send } = remove;
  const isDeleting = snapshot.value === 'deleting';
  const isOpen = snapshot.value === 'confirming' || isDeleting;
  const { domainName, isConnectionActive, error } = snapshot.context;

  return (
    <Dialog.Root
      open={isOpen}
      onOpenChange={open => {
        if (!open) {
          send({ type: 'CANCEL' });
        }
      }}
    >
      <Dialog.Portal>
        <Dialog.Backdrop />
        <Dialog.Viewport>
          <Dialog.Popup>
            <Dialog.Title render={p => <Heading {...p} />}>Remove domain</Dialog.Title>
            <Dialog.Description render={p => <Text {...p} />}>
              {isConnectionActive
                ? `Removing "${domainName}" will stop members with this domain from signing in through SSO.`
                : `The domain "${domainName}" will be removed from this connection.`}
            </Dialog.Description>
            {error && (
              <Box
                role='alert'
                render={p => <p {...p} />}
                sx={t => ({ ...t.text('sm'), color: t.color.destructive, marginBlockStart: t.spacing(2) })}
              >
                {error}
              </Box>
            )}
            <Box sx={t => ({ marginBlockStart: t.spacing(4), display: 'flex', columnGap: t.spacing(2) })}>
              <Button
                variant='outline'
                type='button'
                disabled={isDeleting}
                onClick={() => send({ type: 'CANCEL' })}
              >
                Cancel
              </Button>
              <Button
                intent='destructive'
                type='button'
                disabled={isDeleting}
                onClick={() => send({ type: 'CONFIRM' })}
              >
                Remove domain
              </Button>
            </Box>
          </Dialog.Popup>
        </Dialog.Viewport>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

export function OrganizationProfileSecurityWizardDomainsView({
  domains,
  suggestedDomain,
  hasConnection,
  isConnectionActive,
  add,
  prepare,
  remove,
  onStepMounted,
}: OrganizationProfileSecurityWizardDomainsViewProps) {
  const hasMounted = useRef(false);
  useEffect(() => {
    if (hasMounted.current) {
      return;
    }
    hasMounted.current = true;
    onStepMounted();
  }, [onStepMounted]);

  const list = domains ?? [];
  const verifiedCount = list.filter(domain => domainStatus(domain) === 'verified').length;
  // The add error and the prepare error share the single alert legacy rendered under the field.
  const error = add.snapshot.context.error ?? prepare.snapshot.context.error;

  return (
    <Box sx={t => ({ display: 'flex', flexDirection: 'column', gap: t.spacing(4), minHeight: 0 })}>
      <Box sx={t => ({ display: 'flex', flexDirection: 'column', gap: t.spacing(3) })}>
        <Heading size='base'>Verify your domains</Heading>
        <Text
          render={p => <p {...p} />}
          intent='mutedForeground'
        >
          Add and verify the email domains your members sign in with.
        </Text>

        <AddField
          add={add}
          domains={domains}
        />

        {suggestedDomain && list.length === 0 && (
          <DomainSuggestion
            add={add}
            suggestedDomain={suggestedDomain}
          />
        )}

        {error && (
          <Box
            role='alert'
            render={p => <p {...p} />}
            sx={t => ({ ...t.text('sm'), color: t.color.destructive })}
          >
            {error}
          </Box>
        )}
      </Box>

      {list.length > 0 && (
        <Box
          sx={t => ({ display: 'flex', flexDirection: 'column', gap: t.spacing(3), overflowY: 'auto', minHeight: 0 })}
        >
          {list.map(domain => {
            const isLastVerifiedDomain = domainStatus(domain) === 'verified' && verifiedCount === 1;
            return (
              <DomainCard
                key={domain.id}
                domain={domain}
                prepare={prepare}
                onRemove={() => remove.send({ type: 'OPEN', domainName: domain.name, isConnectionActive })}
                isRemoveDisabled={hasConnection && isLastVerifiedDomain}
              />
            );
          })}
        </Box>
      )}

      <RemoveDialog remove={remove} />
    </Box>
  );
}
