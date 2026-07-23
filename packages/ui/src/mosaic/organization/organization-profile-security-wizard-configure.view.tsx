import { useEffect, useRef, useState } from 'react';

import type { ProviderType } from '@/components/ConfigureSSO/types';

import { Box } from '../components/box';
import { Button } from '../components/button';
import { Dialog } from '../components/dialog';
import { Heading } from '../components/heading';
import { Input } from '../components/input';
import { Text } from '../components/text';
import type { OrganizationProfileSecurityWizardConfigureStep } from './organization-profile-security-panel.controller';

/**
 * The `configure` step body, ported from the legacy nested wizard
 * (`steps/ConfigureStep/index.tsx` + `SelectProviderStep.tsx` + `saml/*`). It renders the
 * select-provider screen or the per-provider SAML sub-flow depending on the machine state, and
 * fires the right event for every navigation. All flow rules live in the machine
 * (`organization-profile-security-wizard-configure.machine.ts`); this layer only renders and sends.
 *
 * Deviation (approved): the rich per-provider instructional content and the manual / file-upload
 * SAML modes are deferred to the view overhaul. The functional slice preserved here is 1:1: pick a
 * provider (create / change / skip), walk the inner steps, submit the metadata-URL payload, and
 * bubble to the outer wizard. The remaining SAML input modes are a tracked view-fidelity item, not
 * a flow difference.
 */

export interface OrganizationProfileSecurityWizardConfigureViewProps {
  configure: OrganizationProfileSecurityWizardConfigureStep;
}

const PROVIDER_OPTIONS: ReadonlyArray<{ id: ProviderType; label: string }> = [
  { id: 'saml_okta', label: 'Okta' },
  { id: 'saml_microsoft', label: 'Microsoft' },
  { id: 'saml_google', label: 'Google' },
  { id: 'saml_custom', label: 'Custom SAML' },
];

const providerLabel = (provider: ProviderType | undefined): string =>
  PROVIDER_OPTIONS.find(option => option.id === provider)?.label ?? '';

export function OrganizationProfileSecurityWizardConfigureView({
  configure,
}: OrganizationProfileSecurityWizardConfigureViewProps) {
  const { snapshot, send, enteredForward } = configure;

  // Reset the inner flow on entry, matching the legacy subtree remounting fresh (forward entry
  // forces select-provider). Fires once per mount — this view mounts/unmounts with the outer step.
  const entered = useRef(false);
  useEffect(() => {
    if (!entered.current) {
      entered.current = true;
      send({ type: 'ENTER', forward: enteredForward });
    }
  }, [send, enteredForward]);

  const value = snapshot.value;
  const isSelecting = value === 'selecting' || value === 'creatingConnection' || value === 'changingProvider';

  return (
    <Box sx={t => ({ display: 'flex', flexDirection: 'column', gap: t.spacing(4) })}>
      {isSelecting ? <SelectProvider configure={configure} /> : <ConfigureProvider configure={configure} />}
    </Box>
  );
}

function SelectProvider({ configure }: { configure: OrganizationProfileSecurityWizardConfigureStep }) {
  const { snapshot, send, provider, onParentPrev } = configure;
  const isBusy = snapshot.value === 'creatingConnection' || snapshot.value === 'changingProvider';
  const [selected, setSelected] = useState<ProviderType | null>(provider ?? null);
  const [changeFrom, setChangeFrom] = useState<ProviderType | null>(null);

  // Continue routes to the right event: same provider → SKIP (no mutation); a different provider on
  // an existing connection → open the change-confirm dialog; otherwise CREATE.
  const handleContinue = () => {
    if (!selected) {
      return;
    }
    if (provider && selected === provider) {
      send({ type: 'SKIP' });
      return;
    }
    if (provider && selected !== provider) {
      setChangeFrom(provider);
      return;
    }
    send({ type: 'CREATE', provider: selected });
  };

  return (
    <Box sx={t => ({ display: 'flex', flexDirection: 'column', gap: t.spacing(4) })}>
      <Heading size='base'>Select your identity provider</Heading>

      <Box sx={t => ({ display: 'flex', flexWrap: 'wrap', gap: t.spacing(2) })}>
        {PROVIDER_OPTIONS.map(option => (
          <Button
            key={option.id}
            type='button'
            variant={selected === option.id ? 'outline' : 'ghost'}
            size='sm'
            aria-pressed={selected === option.id}
            disabled={isBusy}
            onClick={() => setSelected(option.id)}
          >
            {option.label}
          </Button>
        ))}
      </Box>

      {snapshot.context.error && (
        <Text
          render={p => (
            <p
              role='alert'
              {...p}
            />
          )}
          intent='destructive'
        >
          {snapshot.context.error}
        </Text>
      )}

      <Box sx={t => ({ display: 'flex', gap: t.spacing(2) })}>
        <Button
          type='button'
          variant='outline'
          size='sm'
          disabled={isBusy}
          onClick={onParentPrev}
        >
          Back
        </Button>
        <Button
          type='button'
          size='sm'
          disabled={!selected || isBusy}
          onClick={handleContinue}
        >
          Continue
        </Button>
      </Box>

      <Dialog.Root
        open={changeFrom !== null}
        onOpenChange={isOpen => {
          if (!isOpen) {
            setChangeFrom(null);
          }
        }}
      >
        <Dialog.Portal>
          <Dialog.Backdrop />
          <Dialog.Viewport>
            <Dialog.Popup>
              <Dialog.Title>Change identity provider?</Dialog.Title>
              <Dialog.Description>
                {`Changing to ${providerLabel(selected ?? undefined)} removes your ${providerLabel(
                  changeFrom ?? undefined,
                )} connection and its configuration.`}
              </Dialog.Description>
              <Box sx={t => ({ display: 'flex', justifyContent: 'flex-end', gap: t.spacing(2) })}>
                <Button
                  type='button'
                  variant='ghost'
                  size='sm'
                  onClick={() => setChangeFrom(null)}
                >
                  Cancel
                </Button>
                <Button
                  type='button'
                  size='sm'
                  onClick={() => {
                    if (selected) {
                      send({ type: 'CHANGE', provider: selected });
                    }
                    setChangeFrom(null);
                  }}
                >
                  Change provider
                </Button>
              </Box>
            </Dialog.Popup>
          </Dialog.Viewport>
        </Dialog.Portal>
      </Dialog.Root>
    </Box>
  );
}

function ConfigureProvider({ configure }: { configure: OrganizationProfileSecurityWizardConfigureStep }) {
  const { snapshot, send, providerSteps, submitStepId, onParentNext } = configure;
  const { stepIndex } = snapshot.context;
  const stepId = providerSteps[stepIndex] ?? '';
  const isSubmitStep = stepId === submitStepId;
  const isTerminal = stepIndex === providerSteps.length - 1;
  // `saving` (mid or terminal) and `bubblingNext` (terminal save awaiting the deferred outer
  // advance) both keep the Continue button loading, matching legacy's held button.
  const isBusy = snapshot.value === 'saving' || snapshot.value === 'bubblingNext';

  const [metadataUrl, setMetadataUrl] = useState('');
  const canSubmit = metadataUrl.trim().length > 0 && !isBusy;

  const handleContinue = () => {
    if (isSubmitStep) {
      if (canSubmit) {
        send({ type: 'SAVE', payload: { idpMetadataUrl: metadataUrl.trim() } });
      }
      return;
    }
    // Terminal non-submit step (Google's configure-user-access) bubbles to the outer wizard; any
    // other step advances one inner slot.
    if (isTerminal) {
      onParentNext();
      return;
    }
    send({ type: 'NEXT_INNER' });
  };

  return (
    <Box sx={t => ({ display: 'flex', flexDirection: 'column', gap: t.spacing(4) })}>
      <Box sx={t => ({ display: 'flex', alignItems: 'center', gap: t.spacing(2) })}>
        <Heading size='base'>{stepId || 'Configure'}</Heading>
        {providerSteps.length > 1 && (
          <Text
            render={p => <span {...p} />}
            intent='mutedForeground'
          >
            Step {stepIndex + 1}/{providerSteps.length}
          </Text>
        )}
      </Box>

      {isSubmitStep && (
        <Input
          aria-label='Identity provider metadata URL'
          value={metadataUrl}
          onChange={event => setMetadataUrl(event.target.value)}
          placeholder='https://idp.example.com/metadata'
        />
      )}

      {snapshot.context.error && (
        <Text
          render={p => (
            <p
              role='alert'
              {...p}
            />
          )}
          intent='destructive'
        >
          {snapshot.context.error}
        </Text>
      )}

      <Box sx={t => ({ display: 'flex', gap: t.spacing(2) })}>
        <Button
          type='button'
          variant='outline'
          size='sm'
          disabled={isBusy}
          onClick={() => send({ type: 'PREV_INNER' })}
        >
          Back
        </Button>
        <Button
          type='button'
          size='sm'
          disabled={isSubmitStep ? !canSubmit : isBusy}
          onClick={handleContinue}
        >
          Continue
        </Button>
      </Box>
    </Box>
  );
}
